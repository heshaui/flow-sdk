<template>
    <el-upload ref="upload"
               class="upload-music"
               name="file"
               action=""
               :on-change="handleChange"
               :before-upload="beforeUpload"
               :on-success="handleSuccess"
               :on-error="handleError"
               :limit="1"
               accept="audio/wav,audio/mp3"
               :show-file-list="false"
               :auto-upload="false"
    >
        <el-button size="mini" round type="primary" :loading="upload.loading">上传录音</el-button>
    </el-upload>
</template>
<script>
export default {
    name: 'AudioUpload',
    data() {
        return {
            upload: {
                loading: false
            }
        }
    },
    methods: {
        /*
        * 上传
        */
        submitUpload() {
            this.upload.loading = true
            this.$refs.upload.submit()
        },
        /*
        * 上传成功回调
        * @param {Object} res  成功的返回值
        * @param {String} file 成功的文件
        */
        handleSuccess(res) {
            this.upload.loading = false
            this.$emit('uploadSuccess', res)
        },
        /*
        * 上传失败回调
        * @param {Object} err  失败的返回值
        * @param {String} file 失败的文件
        */
        handleError(err) {
            this.upload.loading = false
            this.$emit('uploadError', err)
        },
        /*
        * 上传按钮
        */
        handleChange() {
            this.submitUpload()
        },
        /*
        * 上传前端
        * @param {Object} file 上传的文件
        */
        beforeUpload(file) {
            let fd = new FormData()
            let size = Math.ceil(file.size / 1048576)
            if (size > 100) {
                this.upload.loading = false
                this.$message.error('上传文件最大不可超过100M')
                return false
            }
            if (file.type !== 'audio/wav' && file.type !== 'audio/mp3' && file.type !== 'audio/mpeg') {
                this.upload.loading = false
                this.$message.error('请上传wav、mp3格式音频')
                return false
            }
            fd.append('voicefile', file)
            if (size < 100) {
                this.upload.loading = false
                this.$emit('uploadSuccess', file)
            } else {
                this.upload.loading = false
                this.$message.error('上传文件太大')
            }
            return false
        }
    }
}
</script>
