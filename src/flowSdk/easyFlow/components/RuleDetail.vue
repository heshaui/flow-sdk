<template>
    <el-form ref="ruleForm" :model="form" :rules="rules" label-width="80px">
        <el-row v-if="type === 'ascriptionPlaceRule'" :gutter="10">
            <el-col :span="8">
                <el-form-item
                    label="归属地"
                    required
                >
                    <el-radio-group
                        v-model="form.areaType"
                    >
                        <el-radio :label="0">省</el-radio>
                        <el-radio :label="1">市</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-col>
            <el-col :span="8">
                <el-form-item label-width="0" prop="provinceName" style="margin-left: 10px;">
                    <el-select
                        v-model="form.provinceName"
                        filterable
                        placeholder="请选择省"
                        @change="provinceChange"
                    >
                        <el-option
                            v-for="(v, k) of areaList"
                            :key="k"
                            :label="v.name"
                            :value="v.name"
                        />
                    </el-select>
                </el-form-item>
            </el-col>
            <el-col :span="8">
                <el-form-item label-width="0" prop="cityName" style="margin-left: 10px;">
                    <el-select
                        v-show="form.areaType === 1"
                        v-model="form.cityName"
                        filterable
                        placeholder="请选择市"
                    >
                        <el-option
                            v-for="(v, k) of cityList"
                            :key="k"
                            :label="v.name"
                            :value="v.name"
                        />
                    </el-select>
                </el-form-item>
            </el-col>
        </el-row>
        <div v-if="type === 'crmRule'">
            <el-form-item label="字段名称" prop="variable">
                <el-select
                    v-model="form.variable"
                    placeholder="请选择"
                    style="width: 100%;"
                    @change="fieldChange"
                >
                    <template v-for="(item, key) of fieldList">
                        <el-option
                            v-if="key > 1"
                            :key="key"
                            :label="item.name"
                            :value="item.variable"
                        />
                    </template>
                </el-select>
            </el-form-item>
            <el-form-item label="字段值" prop="value">
                <el-select
                    v-if="rendField.type === 'select'"
                    v-model="form.value"
                    filterable
                    style="width: 100%;"
                >
                    <el-option
                        v-for="(o, k) of rendField.options"
                        :key="k"
                        :label="o.option"
                        :value="o.option"
                    />
                </el-select>
                <el-input
                    v-if="
                        rendField.type === 'text' || rendField.type === 'phone'
                    "
                    v-model="form.value"
                    placeholder="请输入"
                />
                <el-date-picker
                    v-if="rendField.type === 'time'"
                    v-model="form.value"
                    type="datetime"
                    placeholder="选择时间"
                    value-format="timestamp"
                    :disabled="state === 'detail'"
                    style="width: 100%;"
                />
            </el-form-item>
        </div>
        <el-form-item v-if="type === 'urlRule'" label="参数值" prop="value">
            <el-input v-model="form.value" placeholder="请输入" />
        </el-form-item>
        <div v-if="type === 'ivrParamsRule'">
            <el-row>
                <el-col :span="12">
                    <el-form-item label="字段名称" prop="variable">
                        <el-select
                            v-model="form.variable"
                            placeholder="请选择"
                            @change="reCodeChange"
                        >
                            <el-option
                                v-for="(item, key) of receiveCodes"
                                :key="key"
                                :label="item.name"
                                :value="item.variable"
                            />
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="参数名称">
                        <el-input v-model="form.variable"  placeholder="参数名称" disabled />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-form-item label="字段值" prop="value">
                <el-input v-model="form.value" placeholder="请输入" />
            </el-form-item>
        </div>
        <el-form-item label="转接类型" prop="bridgeType">
            <el-select
                v-model="form.bridgeType"
                style="width: 100%;"
                @change="
                    form.bridgeId = '';
                    form.bridgeName = '';
                "
            >
                <el-option label="机器人" value="robot" />
                <el-option label="语音通知" value="notice" />
                <el-option label="技能组" value="group" />
                <el-option label="网关组" value="gw" />
                <el-option label="ivr" value="ivr" />
                <el-option label="放音并挂机" value="playAndHangUp" />
                <el-option label="分机组" value="extension" />
            </el-select>
        </el-form-item>
        <el-form-item
            v-if="form.bridgeType !== 'playAndHangUp'"
            label="转接目标"
            prop="bridgeId"
        >
            <el-select
                v-show="form.bridgeType === 'gw'"
                v-model="form.bridgeId"
                filterable
                placeholder="请选择"
                style="width: 100%;"
                @change="bridgeChange"
            >
                <el-option
                    v-for="(v, key) in gatewayGroup"
                    :key="key"
                    :label="v.name"
                    :value="v.id"
                />
            </el-select>
            <el-select
                v-show="form.bridgeType === 'robot'"
                v-model="form.bridgeId"
                filterable
                placeholder="请选择"
                style="width: 100%;"
                @change="bridgeChange"
            >
                <el-option
                    v-for="(v, key) in flowList"
                    :key="key"
                    :label="v.name"
                    :value="v.id"
                />
            </el-select>
            <el-select
                v-show="form.bridgeType === 'group'"
                v-model="form.bridgeId"
                filterable
                placeholder="请选择"
                style="width: 100%;"
                @change="bridgeChange"
            >
                <el-option
                    v-for="(v, key) in groups"
                    :key="key"
                    :label="v.name"
                    :value="v.id"
                />
            </el-select>
            <el-select
                v-show="form.bridgeType === 'extension'"
                v-model="form.bridgeId"
                filterable
                placeholder="请选择"
                style="width: 100%;"
                @change="bridgeChange"
            >
                <el-option
                    v-for="(v, key) in extensionGroups"
                    :key="key"
                    :label="v.name"
                    :value="v.id"
                />
            </el-select>
            <el-select
                v-show="form.bridgeType === 'notice'"
                v-model="form.bridgeId"
                filterable
                placeholder="请选择"
                style="width: 100%;"
                @change="bridgeChange"
            >
                <el-option
                    v-for="(v, key) in noticeList"
                    :key="key"
                    :label="v.name"
                    :value="v.templateSn"
                />
            </el-select>
            <el-select
                v-show="form.bridgeType === 'ivr'"
                v-model="form.bridgeId"
                filterable
                placeholder="请选择"
                style="width: 100%;"
                @change="bridgeChange"
            >
                <el-option
                    v-for="(v, key) in ivrList"
                    :key="key"
                    :label="v.name"
                    :value="v.id"
                />
            </el-select>
        </el-form-item>
        <el-form-item v-show="form.bridgeType === 'extension'" label="分机">
            <el-select
                v-model="form.targetId"
                filterable
                placeholder="选择分机"
                style="width: 100%;"
            >
                <el-option
                    v-for="(v, key) in seatsList"
                    :key="key"
                    :label="v.agentName"
                    :value="v.id"
                />
            </el-select>
        </el-form-item>
        <el-row v-show="form.bridgeType === 'gw'">
            <el-col :span="12">
                <el-form-item label="主叫号码">
                    <el-select
                        v-model="form.callerType"
                        filterable
                        placeholder="选择主叫"
                        style="width: 100%;"
                        @change="onTypeChange($event, 'caller')"
                    >
                        <el-option label="客户号码" value="custom" />
                        <el-option label="自定义" value="auto" />
                        <el-option
                            v-for="(v, key) in callerList"
                            :key="key"
                            :label="v.caller"
                            :value="v.caller"
                        />
                    </el-select>
                </el-form-item>
            </el-col>
            <el-col :span="12">
                <el-form-item prop="caller">
                    <el-input v-model="form.caller" placeholder="请输入主叫" :disabled="form.callerType !== 'auto'" />
                </el-form-item>
            </el-col>
            <el-col :span="12">
                <el-form-item label="被叫号码">
                    <el-select
                        v-model="form.calledType"
                        filterable
                        placeholder="选择被叫"
                        style="width: 100%;"
                        @change="onTypeChange($event, 'called')"
                    >
                        <el-option label="客户号码" value="custom" />
                        <el-option label="自定义" value="auto" />
                        <el-option
                            v-for="(v, key) in callerList"
                            :key="key"
                            :label="v.caller"
                            :value="v.caller"
                        />
                    </el-select>
                </el-form-item>
            </el-col>
            <el-col :span="12">
                <el-form-item prop="called">
                    <el-input v-model="form.called" placeholder="请输入被叫" :disabled="form.calledType !== 'auto'" />
                </el-form-item>
            </el-col>
        </el-row>
        <script-content
            v-if="form.bridgeType === 'playAndHangUp'"
            ref="textChild"
            :form="{
                src: form.audioFile,
                text: form.audioText,
                id: form.audioId
            }"
            :isRequired="form.audioFile ? false : true"
            :params="params"
            :lain-list="lainList"
            :baseUrl="baseUrl"
            @success="src => (form.audioFile = src)"
            @delAudio="
                form.audioFile = '';
                form.audioId = '';
            "
            @changeText="text => (form.audioText = text)"
            @getAudio="
                data => {
                    form.audioFile = data.src;
                    form.audioId = data.id;
                }
            "
            @getLainId="id => (form.audioId = id)"
        />
        <el-form-item align="center" label-width="0">
            <el-button :loading="loading" type="primary" @click="onSave"
                >保 存</el-button
            >
            <el-button type="danger" @click="onClose">关闭</el-button>
        </el-form-item>
    </el-form>
</template>

<script>
import { cloneDeep } from "lodash";
import { getSeatsList, getField } from '@/api/common';
import areaList from "../area";
import ScriptContent from "../script_content.vue";
export default {
    components: { ScriptContent },
    props: {
        params: Array,
        type: String,
        state: String,
        gatewayGroup: {
            type: Array,
            default: () => []
        },
        flowList: {
            type: Array,
            default: () => []
        },
        groups: {
            type: Array,
            default: () => []
        },
        extensionGroups: {
            type: Array,
            default: () => []
        },
        noticeList: {
            type: Array,
            default: () => []
        },
        lainList: {
            type: Array,
            default: () => []
        },
        ivrList: {
            type: Array,
            default: () => []
        },
        receiveCodes: {
            type: Array,
            default: () => []
        },
        callerList: {
            type: Array,
            default: () => []
        },
        ruleList: Array,
        formData: Object,
        rowIndex: [Number, String],
        baseUrl: String
    },
    data() {
        return {
            fieldList: [],
            rendField: {
                type: "text",
                options: []
            },
            areaList,
            cityList: [],
            loading: false,
            reCodeParams: [],
            seatsList: [],
            form: {
                variable: "",
                name: "",
                value: "",
                bridgeType: "group",
                bridgeId: "",
                bridgeName: "",
                audioFile: "",
                audioText: "",
                audioId: "",
                areaType: 0,
                provinceName: '',
                cityName: '',
                targetName: '',
                targetId: '',
                called: '',
                caller: '',
                callerType: 'auto',
                calledType: 'auto'
            }
        };
    },
    computed: {
        rules() {
            return {
                variable: {
                    required: true,
                    message: "请选择字段名称",
                    trigger: "change"
                },
                value: {
                    required: true,
                    message: this.type==='urlRule' ? "请输入参数值" : '请输入字段值',
                    trigger: "blur"
                },
                bridgeId: {
                    required: true,
                    message: "请选择默认转接目标",
                    trigger: "change"
                },
                provinceName: this.form.areaType === 0 ? {required: true,message: "请选择省",trigger: "change"} : {},
                cityName: this.form.areaType === 1 && !this.form.provinceName.includes('市') ? {required: true,message: "请选择市",trigger: "change"} : {},
                caller: this.form.callerType === 'auto' ? { required: true, message: '请输入主叫号码', trigger: 'blur'} : {},
                called: this.form.calledType === 'auto' ? { required: true, message: '请输入被叫号码', trigger: 'blur'} : {}
            }
        }
    },
    mounted() {
        this.initForm();
        this.getField();
    },
    methods: {
        getField() {
            getField(this.baseUrl).then(res => {
                if (res.data) {
                    const data = JSON.parse(res.data);
                    this.fieldList = data ?? [];
                }
            });
        },
        provinceChange(val, init) {
            if (!init) {
                this.form.cityName = ''
                this.cityList = []
            }
            for (let item of areaList) {
                if (!item.name.includes('市') && item.name === val) this.cityList = item.children
            }
        },
        setAreaValue() {
            if (this.type !== 'ascriptionPlaceRule') return
            if (this.form.areaType === 0) {
                this.form.value = this.form.provinceName
            } else {
                if (this.form.provinceName.includes('市')) {
                    this.form.value = this.form.provinceName
                } else {
                    if (this.form.cityName) {
                        this.form.value = this.form.cityName
                    } else {
                        this.form.value = ''
                    }
                }
            }
            this.handelAreaName()
        },
        handelAreaName() {
            // 处理地区名称
            const pattern = /市|省|自治区|壮族|回族|维吾尔/g
            this.form.value = this.form.value.replace(pattern, '')
            console.log(this.form.value)
        },
        fieldChange(field) {
            this.fieldList.forEach(item => {
                if (item.variable === field) {
                    this.rendField = item;
                    this.form.name = item.name;
                }
            });
        },
        getName(arr, id) {
            arr.forEach(item => {
                if (id === item.id || id === item.templateSn)
                    this.form.bridgeName = item.name;
            });
        },
        reCodeChange(val) {
            this.receiveCodes.forEach(item => {
                if (item.variable === val) {
                    this.form.name = item.name
                }
            })
        },
        bridgeChange(id) {
            switch (this.form.bridgeType) {
                case "robot":
                    this.getName(this.flowList, id);
                    break;
                case "group":
                    this.getName(this.groups, id);
                    break;
                case "extension":
                    this.getName(this.extensionGroups, id);
                    this.getSeatsList(id);
                    break;
                case "gw":
                    this.getName(this.gatewayGroup, id);
                    break;
                case "ivr":
                    this.getName(this.ivrList, id);
                    break;
                case "notice":
                    this.getName(this.noticeList, id);
                    break;
            }
        },
        initForm() {
            if (this.formData) {
                this.form = Object.assign({}, this.formData);
                if (this.form.bridgeType == 'extension') {
                    this.getSeatsList(this.form.bridgeId, true)
                }
                if (this.form.provinceName) this.provinceChange(this.form.provinceName, true)
            }
        },
        onClose() {
            this.$emit("onClose");
        },
        duplicationCheck() {
            const data = this.form;
            let mark = true;
            let ruleList = cloneDeep(this.ruleList);
            if (this.state !== "add") {
                ruleList.splice(this.rowIndex, 1);
            }
            ruleList.forEach(item => {
                if (
                    data.variable === item.variable &&
                    data.value === item.value
                ) {
                    let msg =
                        this.type === "crmRule"
                            ? "字段值不可重复"
                            : this.type === "urlRule"
                            ? "参数值不可重复"
                            : "归属地不可重复";
                    this.$message.error(msg);
                    mark = false;
                }
            });
            return mark;
        },
        onSave() {
            this.setAreaValue()
            this.$refs.ruleForm.validate(valid => {
                if (valid) {
                    const mark = this.duplicationCheck();
                    if (!mark) return;
                    if (
                        this.form.bridgeType === "playAndHangUp" &&
                        !this.$refs.textChild.validateForm()
                    )
                        return;
                    this.loading = true;
                    if (this.form.bridgeType == 'extension' && this.form.targetId) {
                        let target = this.seatsList.find(t => t.id == this.form.targetId);
                        if (target) {
                            this.form.targetName = target.agentName;
                        }
                    }
                    this.$message.success("保存成功");
                    this.$emit("onSave", this.form);
                    this.loading = false;
                    this.$refs.ruleForm.clearValidate();
                }
            });
        },
        getSeatsList(extensionId, init) {
            getSeatsList(this.baseUrl, {
                companyId: localStorage.companyId,
                groupId: extensionId,
                type: 2
            }).then(res => {
                if (res.data) {
                    if (!init) {
                        this.form.targetId = '';
                    }
                    this.seatsList = res.data;
                }
            })
        },
        // 主叫/被叫类型change事件
        onTypeChange(val, type) {
            if (val !== 'custom' && val !== 'auto') {
                this.form[type] = val
            } else if (val === 'custom') {
                this.form[type] = ''
            }
        }
    }
};
</script>
