<template>
    <div class="auditionTimbre">
        <el-button size="small" type="primary" icon="el-icon-headset" @click="audioDialog=true">试听音色</el-button>
        <el-dialog title="试听音色" :visible.sync="audioDialog" append-to-body :close-on-click-modal="false" width="400px" class="hBg" @close="onClose">
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
        type: String
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
        onClose() {
            this.$refs.audio.pause()
        },
        handleAudio() {
            this.audioSrc = ''
            this.audioLoading = true
            let url = `obc/api/tts/voice/download`
            let text = '您好，这里是音色试听，您好，这里是音色试听'
            if (this.type === 'ivr') {
                if (this.params.auditionContent) text = this.params.auditionContent.slice(0, 300)
            } else {
                if (this.params.content) text = this.params.content.slice(0, 300)
            }
            axios.get(url, {
                responseType: 'arraybuffer',
                params: {
                    token: localStorage.token,
                    volume: this.params.volume,
                    pitch: this.type === 'ivr' ? this.params.intonation : this.params.pitch,
                    speech: this.type === 'ivr' ? this.params.speed : this.params.speech,
                    voice: this.type === 'ivr' ? this.params.speaker : this.params.sayUser,
                    text: text
                }
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
