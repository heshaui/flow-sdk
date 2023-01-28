<template>
    <div>
         <el-form-item :label="label">
            <!-- 插入参数 -->
            <el-dropdown v-if="!node.src" trigger="click" style="float: right; margin-left: 15px;" @command="insertParam">
                <el-button type="primary" plain round size="mini">
                    插入参数<i class="el-icon-arrow-down el-icon--right" />
                </el-button>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item v-for="v of params" :key="v.variable" :command="v.variable">{{ v.name }}</el-dropdown-item>
                    <el-dropdown-item v-if="params && params.length < 1">暂无数据</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
            <audio-upload ref="audioUpload" v-if="!node.src" style="margin-bottom: 10px; float: right;" class="upload-demo" type="node" @uploadSuccess="uploadSuccess"></audio-upload>
            <el-input v-if="!node.src" v-model="node.text" type="textarea" maxlength="200" rows="3" @blur="getConPos($event)" @change="textChange"></el-input>
        </el-form-item>
        <!-- 音频 -->
        <div v-if="node.src" class="audioBox">
            <audio controls="controls" controlsList="nodownload" :src="audioSrc"/>
            <el-tooltip effect="light" placement="top" content="删除">
                <i class="el-icon-delete" style="color: #f56c6c; font-size: 20px; margin-left: 10px;" @click="deleteAudio" />
            </el-tooltip>
        </div>
    </div>
</template>

<script>
import { uploadFile } from '@/api/common'
import AudioUpload from './audioUpload.vue'
export default {
    components: { AudioUpload },
    props: {
        label: {
            type: String,
            default: '话术内容'
        },
        form: {
            type: Object,
            default() {
                return {
                    src: '',
                    text: ''
                }
            }
        },
        params: {
            type: Array,
            default() {
                return []
            }
        }
    },
    data() {
        return {
            conPos: 0,
            node: {
                src: '',
                text: ''
            },
            audioSrc: ''
        }
    },
    watch: {
        'form.src'(newVal) {
            this.node.src = newVal
            this.getSrc(newVal)
        },
        'form.text'(newVal) {
            this.node.text = newVal
        }
    },
    created() {
        this.node = Object.assign({}, this.form)
        this.getSrc(this.node.src)
    },
    methods: {
        getSrc(src) {
            this.audioSrc = `obc/api/file/download/${src}?token=${localStorage.token}`
        },
        // 获取内容中鼠标的位置
        getConPos(e) {
            this.conPos = e.target.selectionStart
        },
        // 插入参数
        insertParam(name) {
            this.node.text = name ? `${this.node.text.slice(0, this.conPos)}{${name}}${this.node.text.slice(this.conPos)}` : this.node.text
            this.textChange()
        },
        // 根据语音文件转换成可用的url
        readerAudio(file) {
            // 将语音文件转换成可播放的url
            let reader = new FileReader()
            reader.readAsDataURL(file)
            // 转换成功后的操作，reader.result即为转换后的DataURL
            reader.onload = () => {
                this.node.src = reader.result
                this.$emit('success', this.node.src)
                 this.$message.success('上传成功')
            }
        },
        // 上传音频
        uploadAudio(file) {
            let formdata = new FormData()
            formdata.append('file', file)
            uploadFile(formdata).then(res => {
                this.node.src = res.data
                this.getSrc(res.data)
                this.$emit('success', this.node.src)
                this.$message.success('上传成功')
            })
        },
        // 上传文件成功
        uploadSuccess(file) {
            // this.readerAudio(file)
            this.uploadAudio(file)
        },
        // 删除文件
        deleteAudio() {
            this.$confirm('您确定删除当前语音', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.node.src = null
                this.$emit('delAudio')
                this.$message.success('已删除')
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消'
                })
            })
        },
        textChange() {
            this.$emit('changeText', this.node.text)
        }
    }
}
</script>

