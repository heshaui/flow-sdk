<template>
    <FlowSdk 
        v-if="sdkOff" 
        :id="id" 
        :state="state" 
        :close-btn="closeBtn" 
        @onClose = "onClose"
        @onSave = "onSave"
    />
</template>

<script>
import FlowSdk from './panel.vue'
export default {
    components: { FlowSdk },
    props: {
        id: String,
        state: String,
        closeBtn: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            sdkOff: true
        }
    },
    methods: {
        onClose() {
            this.$emit('onClose')
            this.sdkOff = false
        },
        onSave(id) {
            this.$emit('onSave', id)
            this.sdkOff = false
        }
    }
}
</script>