<template>
    <div class="saveLain">
        <el-button v-if="size==='btn'" size="small" type="primary" @click="saveLain">保存至录音库</el-button>
        <el-tooltip v-else class="item" effect="dark" content="保存至录音库" placement="top">
            <svg-icon name="save" style="font-size: 25px; color: #409eff;" @click="saveLain" />
        </el-tooltip>
        <el-dialog title="添加录音" :visible.sync="lainDialog" :close-on-click-modal="false" append-to-body width="500px" class="hBg">
            <el-form ref="lainForm" :model="lainForm" :rules="rules" label-width="80px">
                <el-form-item label="录音名称" prop="audioName">
                    <el-input v-model="lainForm.audioName" autocomplete="off" :maxlength="250" placeholder="请输入名称" style="width: 300px;" />
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer" style="text-align: center;">
                <el-button type="primary" @click="lainSubmit">保 存</el-button>
                <el-button @click="lainDialog = false">取 消</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { saveLain, uploadLain } from '@/api/common'
export default {
    props: {
        voicePath: String,
        file: File,
        size: {
            type: String,
            default: 'btn'
        },
        baseUrl: String
    },
    data() {
        return {
            lainDialog: false,
            lainForm: {
                audioName: ''
            },
            rules: {
                audioName: [
                    { required: true, message: '请输入名称', trigger: 'blur' }
                ]
            }
        }
    },
    methods: {
        saveLain() {
            this.lainDialog = true
            this.lainForm.audioName = ''
        },
        uploadFile() {
            const params = new FormData()
            params.append('audioName', this.lainForm.audioName)
            params.append('file', this.file)
            uploadLain(this.baseUrl, params).then(res => {
                this.$message.success('已保存至录音库')
                this.$emit('getAudioId', res.data)
                this.lainDialog = false
            })
        },
        savePath() {
            saveLain(this.baseUrl, {
                audioName: this.lainForm.audioName,
                filePath: this.voicePath
            }).then(res => {
                this.$message.success('已保存至录音库')
                this.$emit('getAudioId', res.data)
                this.lainDialog = false
            })
        },
        lainSubmit() {
            this.$refs.lainForm.validate(valid => {
                if (valid) {
                    if (this.file) {
                        this.uploadFile()
                    } else {
                        this.savePath()
                    }
                }
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.saveLain {
    display: inline-block;
    margin-left: 20px;
}
</style>
