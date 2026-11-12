package com.minimart24.kiosk

import android.annotation.SuppressLint
import android.app.Activity
import android.os.Bundle
import android.util.Log
import android.view.KeyEvent
import android.view.View
import android.view.WindowManager
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android_serialport_api.SerialPort
import java.io.File
import java.io.IOException
import java.util.concurrent.Executors

class MainActivity : Activity() {

    private lateinit var webView: WebView
    private val serialExecutor = Executors.newSingleThreadExecutor()

    @Volatile
    private var serialPort: SerialPort? = null

    @Volatile
    private var currentPortPath: String = DEFAULT_SERIAL_PORT

    @Volatile
    private var currentBaudRate: Int = DEFAULT_BAUD_RATE

    @Volatile
    private var handshakeVerified: Boolean = false

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        applyImmersiveFullscreen()

        webView = WebView(this).apply {
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                cacheMode = WebSettings.LOAD_DEFAULT
                mediaPlaybackRequiresUserGesture = false
                useWideViewPort = true
                loadWithOverviewMode = true
                allowFileAccess = true
            }

            webViewClient = object : WebViewClient() {
                @Deprecated("Deprecated in Java")
                override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                    return false
                }
            }
            webChromeClient = WebChromeClient()
            addJavascriptInterface(AndroidVendingBridge(), "AndroidVending")
        }

        setContentView(webView)
        webView.loadUrl(KIOSK_URL)

        connectSerialPortAsync(currentPortPath, currentBaudRate)
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            applyImmersiveFullscreen()
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        // Blocked in kiosk mode so customers cannot exit MINI MART 24
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        if (keyCode == KeyEvent.KEYCODE_BACK || keyCode == KeyEvent.KEYCODE_HOME) {
            return true
        }
        return super.onKeyDown(keyCode, event)
    }

    override fun onDestroy() {
        super.onDestroy()
        serialExecutor.execute {
            try {
                serialPort?.closePort()
            } catch (_: Exception) {
            }
        }
        serialExecutor.shutdown()
    }

    private fun applyImmersiveFullscreen() {
        @Suppress("DEPRECATION")
        window.decorView.systemUiVisibility = (
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_FULLSCREEN
            )
    }

    private fun connectSerialPortAsync(portPath: String, baudRate: Int) {
        serialExecutor.execute {
            connectSerialInternal(portPath, baudRate)
        }
    }

    private fun connectSerialInternal(portPath: String, baudRate: Int): Boolean {
        try {
            serialPort?.closePort()
        } catch (_: Exception) {
        }
        serialPort = null
        handshakeVerified = false

        val normalizedPort = if (SUPPORTED_PORTS.contains(portPath)) portPath else DEFAULT_SERIAL_PORT
        val normalizedBaud = if (baudRate == 9600 || baudRate == 115200) baudRate else DEFAULT_BAUD_RATE
        currentPortPath = normalizedPort
        currentBaudRate = normalizedBaud

        return try {
            val port = SerialPort(File(normalizedPort), normalizedBaud, 0)
            try {
                port.SetSerialParam(normalizedBaud, 8, 1, 0)
            } catch (e: UnsatisfiedLinkError) {
                Log.w(TAG, "SetSerialParam optional native symbol missing", e)
            }

            serialPort = port

            // Handshake step 1: buildPacket(packIdBytes(0, 0, 16, 0), byteArrayOf())
            val initPkt = buildPacket(packIdBytes(0, 0, 16, 0), byteArrayOf())
            sendPacket(port, initPkt)
            Thread.sleep(100)

            // Handshake step 2: verify with buildPacket(packIdBytes(1, 0, 1, 0), byteArrayOf())
            val verifyPkt = buildPacket(packIdBytes(1, 0, 1, 0), byteArrayOf())
            sendPacket(port, verifyPkt)
            val response = readHcznResponse(port, 1200)
            handshakeVerified = response != null

            Log.i(
                TAG,
                "Serial connected on $normalizedPort @ $normalizedBaud (handshakeVerified=$handshakeVerified)"
            )
            true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to open serial port $normalizedPort @ $normalizedBaud", e)
            false
        }
    }

    private fun sendPacket(port: SerialPort, packet: ByteArray) {
        val out = port.outputStream
        // Drain stale input buffer before sending command
        val input = port.inputStream
        while (input.available() > 0) {
            input.read()
        }
        out.write(packet)
        out.flush()
    }

    private fun readHcznResponse(port: SerialPort, timeoutMs: Long): ByteArray? {
        val input = port.inputStream
        val deadline = System.currentTimeMillis() + timeoutMs
        val ring = ArrayList<Byte>(128)

        while (System.currentTimeMillis() < deadline) {
            val available = try {
                input.available()
            } catch (e: IOException) {
                return null
            }

            if (available > 0) {
                val buf = ByteArray(available)
                val count = input.read(buf)
                for (i in 0 until count) {
                    ring.add(buf[i])
                }

                // Parse buffer for BROADCAST_1 / BROADCAST_2 (+8 bytes) or HCZN frame
                var idx = 0
                while (idx <= ring.size - 4) {
                    if (matchesAt(ring, idx, BROADCAST_1) || matchesAt(ring, idx, BROADCAST_2)) {
                        // Ignore broadcast frame: 4-byte header + 8 bytes payload
                        val skipEnd = minOf(ring.size, idx + 4 + 8)
                        idx = skipEnd
                        continue
                    }

                    if (matchesAt(ring, idx, CMD_HEAD)) {
                        if (idx + 6 <= ring.size) {
                            val totalLen = (ring[idx + 4].toInt() and 0xFF) or
                                ((ring[idx + 5].toInt() and 0xFF) shl 8)
                            if (totalLen in 8..512 && idx + totalLen <= ring.size) {
                                return ring.subList(idx, idx + totalLen).toByteArray()
                            }
                        }
                        break
                    }
                    idx++
                }
            } else {
                Thread.sleep(15)
            }
        }
        return null
    }

    private fun matchesAt(data: List<Byte>, offset: Int, header: ByteArray): Boolean {
        if (offset + header.size > data.size) return false
        for (i in header.indices) {
            if (data[offset + i] != header[i]) return false
        }
        return true
    }

    // 4-byte little-endian conversion
    private fun intToBytes(v: Int): ByteArray {
        return byteArrayOf(
            (v and 0xFF).toByte(),
            ((v ushr 8) and 0xFF).toByte(),
            ((v ushr 16) and 0xFF).toByte(),
            ((v ushr 24) and 0xFF).toByte()
        )
    }

    private fun packIdBytes(openType: Int, dataType: Int, cmdIndex: Int, devNo: Int): ByteArray {
        val packed = openType or
            (dataType shl 1) or
            (cmdIndex shl 5) or
            (devNo shl 11) or
            285212672
        return intToBytes(packed)
    }

    // CMD_HEAD + 2-byte LE length (idBytes.size + 6 + dataBytes.size + 2) + idBytes + dataBytes + 2-byte LE byte sum checksum
    private fun buildPacket(idBytes: ByteArray, dataBytes: ByteArray): ByteArray {
        val totalLength = idBytes.size + 6 + dataBytes.size + 2
        val lenLow = (totalLength and 0xFF).toByte()
        val lenHigh = ((totalLength ushr 8) and 0xFF).toByte()

        val payload = ByteArray(totalLength)
        var pos = 0

        System.arraycopy(CMD_HEAD, 0, payload, pos, CMD_HEAD.size)
        pos += CMD_HEAD.size

        payload[pos++] = lenLow
        payload[pos++] = lenHigh

        System.arraycopy(idBytes, 0, payload, pos, idBytes.size)
        pos += idBytes.size

        if (dataBytes.isNotEmpty()) {
            System.arraycopy(dataBytes, 0, payload, pos, dataBytes.size)
            pos += dataBytes.size
        }

        var checksum = 0
        for (i in 0 until pos) {
            checksum += (payload[i].toInt() and 0xFF)
        }

        payload[pos++] = (checksum and 0xFF).toByte()
        payload[pos] = ((checksum ushr 8) and 0xFF).toByte()

        return payload
    }

    inner class AndroidVendingBridge {
        @JavascriptInterface
        fun dispense(row: Int, col: Int) {
            Log.i(TAG, "JS requested dispense(row=$row, col=$col)")
            serialExecutor.execute {
                val port = serialPort ?: run {
                    connectSerialInternal(currentPortPath, currentBaudRate)
                    serialPort
                }

                if (port == null) {
                    Log.e(TAG, "SerialPort unavailable; cannot dispense row=$row col=$col")
                    return@execute
                }

                val dataBytes = intToBytes(row) + intToBytes(col) + intToBytes(0)
                val packet = buildPacket(packIdBytes(0, 7, 1, 0), dataBytes)

                try {
                    sendPacket(port, packet)
                    val resp = readHcznResponse(port, 3500)
                    Log.i(
                        TAG,
                        "Dispense row=$row col=$col complete; HCZN response bytes=${resp?.size ?: 0}"
                    )
                } catch (e: Exception) {
                    Log.e(TAG, "Dispense serial I/O error for row=$row col=$col", e)
                }
            }
        }

        @JavascriptInterface
        fun configureSerial(portPath: String, baudRate: Int) {
            connectSerialPortAsync(portPath, baudRate)
        }

        @JavascriptInterface
        fun getSerialStatus(): String {
            val open = serialPort != null
            return """{"open":$open,"port":"$currentPortPath","baud":$currentBaudRate,"handshake":$handshakeVerified}"""
        }
    }

    companion object {
        private const val TAG = "MiniMart24Kiosk"

        // Replace with your deployed MINI MART 24 PWA URL or local asset URL
        private const val KIOSK_URL = "https://your-minimart24-pwa-url.example.com"

        private const val DEFAULT_SERIAL_PORT = "/dev/ttyS1"
        private const val DEFAULT_BAUD_RATE = 115200
        private val SUPPORTED_PORTS = setOf("/dev/ttyS1", "/dev/ttyS2", "/dev/ttyS3", "/dev/ttyS4")

        // HCZN binary serial protocol constants
        private val CMD_HEAD = byteArrayOf(0x48, 0x43, 0x5A, 0x4E) // "HCZN"
        private val BROADCAST_1 = byteArrayOf(72, 75, 90, -98)
        private val BROADCAST_2 = byteArrayOf(72, 75, 90, 79)
    }
}
