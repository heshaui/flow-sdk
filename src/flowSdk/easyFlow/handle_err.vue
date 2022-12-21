<template>
    <div>
        <h3>按键错误</h3>
        <el-form-item label="连续触发次数">
            <el-input-number v-model="node.errNum" :min="1"/>
        </el-form-item>
        <script-content
            :form="{
                src: node.errSrc,
                text: node.errText
            }"
            :params="params"
        />
        <el-form-item label="超出次数，执行">
            <el-select v-model="node.errOverNum">
                <el-option label="挂机" :value="0"/>
                <el-option label="返回" :value="1"/>
                <el-option label="转人工" :value="2"/>
            </el-select>
        </el-form-item>
        <h3>无响应</h3>
        <el-form-item label="连续触发次数">
            <el-input-number v-model="node.noResNum" :min="1"/>
        </el-form-item>
        <script-content
            :form="{
                src: node.noResSrc,
                text: node.noResText
            }"
            :params="params"
        />
        <el-form-item label="超出次数，执行">
            <el-select v-model="node.noResOverNum">
                <el-option label="挂机" :value="0"/>
                <el-option label="返回" :value="1"/>
                <el-option label="转人工" :value="2"/>
            </el-select>
        </el-form-item>
    </div>
</template>

<script>
import ScriptContent from './script_content.vue'
export default {
    components: { ScriptContent },
    props: {
        node: {
            type: Object,
            default() {
                return {
                    // 按键错误
                    errNum: 1,
                    errSrc: '',
                    errText: '',
                    errOverNum: 1,
                    // 无响应
                    noResNum: 1,
                    noResSrc: '',
                    noResText: '',
                    noResOverNum: 1
                }
            }
        },
        params: {
            type: Array,
            default() {
                return []
            }
        }
    }
}
</script>
