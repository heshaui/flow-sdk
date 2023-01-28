<template>
    <div class="auditionTimbre">
        <el-button size="small" type="primary" icon="el-icon-headset" @click="playAudio">试听音色</el-button>
        <el-dialog title="试听音色" :visible.sync="audioDialog" append-to-body :close-on-click-modal="false" width="400px" class="hBg index3000" @close="onClose">
            <div v-loading="audioLoading">
                <audio v-if="isIos" ref="audio" controls="controls" autoplay>
                    <source type="audio/mpeg" :src="audioSrc">
                    <source type="audio/ogg" :src="audioSrc">
                    <source type="audio/wav" :src="audioSrc">
                </audio>
                <audio v-else ref="audio" controls="controls" :src="audioSrc" autoplay />
            </div>
        </el-dialog>
    </div>
</template>

<script>
import axios from 'axios'
export default {
    name: 'AuditionTimbre',
    props: {
        params: {
            type: Object,
            default: null
        },
        type: String,
        tts: {
            type: String,
            default: 'ali'
        }
    },
    data() {
        return {
            audioDialog: false,
            audioLoading: false,
            audioSrc: '',
            isIos: false
        }
    },
    watch: {
        audioDialog(val) {
            val && this.handleAudio()
        }
    },
    mounted() {
        this.appSource()
    },
    methods: {
        appSource() {
            const u = navigator.userAgent
            const isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
            this.isIos = isiOS
        },
        setParams() {
            let text = '您好，这里是音色试听，您好，这里是音色试听'
            if (this.type === 'ivr') {
                if (this.params.auditionContent) text = this.params.auditionContent.slice(0, 300)
            } else {
                if (this.params.content) text = this.params.content.slice(0, 300)
            }
            const params = {
                token: localStorage.token,
                volume: this.params.volume,
                pitch: this.type === 'ivr' ? this.params.intonation : this.params.pitch,
                speech: this.type === 'ivr' ? this.params.speed : this.params.speech,
                voice: this.type === 'ivr' ? this.params.speaker : this.params.sayUser,
                text: text
            }
            return params
        },
        playAudio() {
            const params = this.setParams()
            if (!params.volume && params.volume !== 0) {
                this.$message.error('请输入音量，音量范围0～100')
                return false
            } else if (this.tts === 'ali' && !params.pitch && params.pitch !== 0) {
                this.$message.error('请输入语调，语调范围-500～500')
                return false
            } else if (!params.speech && params.speech !== 0) {
                if (this.tts === 'ali') {
                    this.$message.error('请输入语速，语速范围-500～500')
                } else {
                    this.$message.error('请输入语速，语速范围0～100')
                }
                return false
            }
            this.audioDialog = true
        },
        onClose() {
            this.$refs.audio.pause()
        },
        handleAudio() {
            this.audioSrc = ''
            this.audioLoading = true
            let url = 'obc/api/tts/voice/download'
            axios.get(url, {
                responseType: 'arraybuffer',
                params: this.setParams()
            }).then(res => {
                const sblod = new Blob([res.data])
                if (window.URL) {
                    this.audioSrc = window.URL.createObjectURL(sblod)
                } else {
                    this.audioSrc = sblod
                }
                this.audioLoading = false
            })
        }
    }
}
</script>

<style scoped>
audio {
    width: 100% !important;
}
</style>
