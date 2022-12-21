<template>
    <el-dialog
            title="流程数据信息"
            :visible.sync="dialogVisible"
            width="70%"
            append-to-body
            custom-class="flowInfo"
    >
        <el-alert
                title="使用说明"
                type="warning"
                description="以下流程信息可以被存储起来，方便下一次流程加载"
                show-icon
                close-text="知道了"
        >
        </el-alert>
        <br/>
        <!--一个高亮显示的插件-->
        <codemirror
                :value="flowJsonData"
                :options="options"
                class="code"
                @input="codeChange"
        ></codemirror>
        <div style="padding: 20px 0; text-align: right;">
            <el-button type="danger" @click="close">关 闭</el-button>
            <el-button type="success" v-clipboard:copy="flowJsonData" v-clipboard:success="onCopy" v-clipboard:error="onError">复 制</el-button>
            <el-button type="primary" @click="save">保 存</el-button>
        </div>
    </el-dialog>
</template>

<script>
    import 'codemirror/lib/codemirror.css'
    import { codemirror } from 'vue-codemirror'

    require("codemirror/mode/javascript/javascript.js")

    export default {
        props: {
            data: Object,
        },
        data() {
            return {
                dialogVisible: false,
                flowJsonData: {},
                options: {
                    mode: {name: "javascript", json: true},
                    lineNumbers: true
                }
            }
        },
        components: {
            codemirror
        },
        methods: {
            init() {
                this.dialogVisible = true
                this.flowJsonData = JSON.stringify(this.data, null, 4).toString()
            },
            codeChange(newCode) {
                this.flowJsonData = newCode
            },
            save() {
                const newData = JSON.parse(this.flowJsonData)
                this.dialogVisible = false
                this.$emit('saveCode', newData)
            },
            // 复制成功时的回调函数
            onCopy() {
                this.$message.success('内容已复制到剪切板！')
            },
            // 复制失败时的回调函数
            onError() {
                this.$message.error('抱歉，复制失败！')
            },
            close() {
                this.dialogVisible = false
            }
        }
    }
</script>
<style>
    .flowInfo {
        height: 90%;
    }
    .flowInfo .CodeMirror {
        height: 80%;
    }
</style>
