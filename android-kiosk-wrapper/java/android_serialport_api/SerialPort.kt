package android_serialport_api

import android.util.Log
import java.io.File
import java.io.FileDescriptor
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.IOException

class SerialPort(device: File, baudrate: Int, flags: Int = 0) {

    private var mFd: FileDescriptor? = null
    val inputStream: FileInputStream
    val outputStream: FileOutputStream

    init {
        if (!device.canRead() || !device.canWrite()) {
            try {
                val su = Runtime.getRuntime().exec("/system/bin/su")
                val cmd = "chmod 666 ${device.absolutePath}\nexit\n"
                su.outputStream.write(cmd.toByteArray())
                if (su.waitFor() != 0 || !device.canRead() || !device.canWrite()) {
                    throw SecurityException("Cannot grant rw permission to ${device.absolutePath}")
                }
            } catch (e: Exception) {
                Log.w(TAG, "Root chmod failed or unavailable for ${device.absolutePath}", e)
                throw SecurityException("Serial port permission denied: ${device.absolutePath}")
            }
        }

        val fd = open(device.absolutePath, baudrate, flags)
            ?: throw IOException("Native open() returned null for ${device.absolutePath}")

        mFd = fd
        inputStream = FileInputStream(fd)
        outputStream = FileOutputStream(fd)
    }

    fun closePort() {
        try {
            inputStream.close()
        } catch (_: IOException) {
        }
        try {
            outputStream.close()
        } catch (_: IOException) {
        }
        close()
        mFd = null
    }

    external fun open(path: String, baudrate: Int, flags: Int): FileDescriptor?
    external fun close()
    external fun SetSerialParam(baudrate: Int, dataBits: Int, stopBits: Int, parity: Int): Int
    external fun CheckSerilData(): Int

    companion object {
        private const val TAG = "SerialPort"

        init {
            System.loadLibrary("machineLib")
        }
    }
}
