<template>
    <div class="wTable">
        <!-- 头部工具栏 -->
        <div v-if="tools && tools.length>0 && tools[0].label" class="toolBar">
            <template v-for="(tool, key) in tools">
                <!-- 具名插槽 -->
                <slot v-if="tool.slot" :name="tool.slot" />
                <el-button
                    v-else-if="tool"
                    :key="key"
                    :type="tool.type"
                    :size="tool.size"
                    :plain="tool.plain"
                    :round="tool.round"
                    :circle="tool.circle"
                    :icon="tool.icon"
                    :style="tool.style"
                    :disabled="tool.disabled"
                    @click.native.prevent="tool.method()"
                >
                    {{ tool.label }}
                </el-button>
            </template>
        </div>
        <!-- 表格 -->
        <el-table
            id="wTable"
            ref="wTable"
            v-loading="isLoading"
            element-loading-text="加载中......"
            :data="data"
            :height="tHeight"
            :max-height="maxHeight"
            :stripe="woptions.stripe"
            :border="woptions.border"
            :fit="woptions.fit"
            :span-method="spanMethod"
            :show-summary="woptions.showSummary"
            :show-header="woptions.showHeader"
            :row-key="rowKey"
            :expand-row-keys="expands"
            @expand-change="expandSelect"
            @selection-change="handleSelectionChange"
            @row-click="handleRowClick"
        >
            <!-- 多选框 -->
            <el-table-column v-if="woptions.mutiSelect" :reserve-selection="true" type="selection" :selectable="woptions.checkSelect" style="width: 55px;" align="center" class-name="select" />
            <!-- 序号 -->
            <el-table-column v-if="woptions.index" :fixed="woptions.indexFixedLeft" label="序号" type="index" width="60px" align="center" />
            <!-- 数据列 -->
            <template v-for="(column, index) of columns">
                <!-- 如过有嵌套，递归多级表头 -->
                <template v-if="column.children && column.children.length > 0">
                    <WColumn :key="index" :column="column" />
                </template>
                <!-- 没有正常显示 -->
                <template v-else>
                    <!-- 具名插槽 -->
                    <slot v-if="column.slot" :name="column.slot" />
                    <el-table-column
                        v-else-if="!column.isHide"
                        v-slot="scope"
                        :key="index"
                        :prop="column.prop"
                        :label="column.label"
                        :type="column.type"
                        :min-width="column.minWidth"
                        :span-method="spanMethod"
                        :width="column.width"
                        :align="column.align"
                        :fixed="column.fixed"
                        :show-overflow-tooltip="column.tooltip"
                        :class-name="column.class"
                        :sortable="column.sort"
                    >
                        <!-- 是否需要特殊处理 -->
                        <template v-if="column.formatter">
                            <span v-html="column.formatter(scope.row, column)" />
                        </template>
                        <template v-else>
                            <!-- 正常显示 -->
                            <span>{{ scope.row[column.prop] }}</span>
                        </template>
                    </el-table-column>
                </template>
            </template>
        </el-table>
        <!-- 分页 -->
        <div v-if="isPagination" class="pagination">
            <el-pagination
                :background="$isXs ? false : true"
                :samll="$isXs ? true : false"
                :pager-count="$isXs ? 5 : 7"
                :current-page="wpagination.currentPage"
                :page-sizes="wpagination.pageArr"
                :page-size="wpagination.pagesize"
                :layout="$isXs ? 'prev, pager, next' : 'total, sizes, prev, pager, next, jumper'"
                :total="total"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
            />
            <div class="hidden-sm-and-up" style="color: #666; line-height: 25px; font-size: 14px;">共{{ total }}条</div>
        </div>
    </div>
</template>

<script>
/**
 * 使用方法：
 * 通用的可参考 views/businessManage/businessList
 * 多级表头可参考 views/dingdang/privacyCallInfo
 * 合并行可参考 views/codeManage/routeTest
 */
import WColumn from './WColumn'
export default {
    name: 'WTable',
    components: { WColumn },
    props: {
        // 头部按钮组
        tools: {
            type: Array,
            default() {
                return [
                    {method() {}}
                ]
            }
        },
        // 数据
        data: {
            type: Array,
            requre: true,
            default() {
                return []
            }
        },
        // 是否loading
        isLoading: {
            type: Boolean,
            default: false
        },
        // 合并行
        spanMethod: Function,
        // 多选回显key
        rowKey: {
            type: String,
            default: 'id'
        },
        expands: {
            type: Array,
            default: () => []
        },
        /**
         * 表格默认配置
         * height: 表格高度
         * stripe: 是否为斑马纹 table
         * border: 是否带有纵向边框
         * fit: 列的宽度是否自撑开
         * mutiSelect: 是否开启多选
         * loading: 添加loading
         */
        options: {
            type: Object,
            default() {
                return {
                    stripe: true,
                    border: false,
                    fit: true,
                    mutiSelect: false,
                    index: true,
                    isDrag: '0',
                    indexFixedLeft: false,
                    showHeader: true
                }
            }
        },
        // 表格高度
        tHeight: {
            type: [ Number, String ],
            default: 200
        },
        // 表格高度
        maxHeight: [ Number, String ],
        /**
         * 列集合
         * prop: 列字段
         * label: 列名称
         * align: 文本显示位置
         * width: 列固定宽度，例：200
         * minWidth: 自适应宽度 例： 200 或 20%
         * type: 类型
         * formatter: 特殊处理
         * slot: 特殊列名称
         * isHide: 是否隐藏列，用于动态展示列
         * tooltip: 超出是否...
         * class: 列的class
         * sort: 是否排序
         */
        columns: {
            type: Array,
            default() {
                return []
            },
            require: true
        },
        // 数据总数
        total: {
            type: Number,
            default: 0
        },
        // 是否显示分页
        isPagination: {
            type: Boolean,
            default: true
        },
        /**
         * 分页参数
         * pagesize:每页显示的条数
         * currentPage:当前页码
         * pageArr: 显示多少条集合
         * background: 是否要背景
         */
        pagination: {
            type: Object,
            default() {
                return {
                    pagesize: 10,
                    background: true,
                    currentPage: 1,
                    pageArr: [10, 20, 50, 100]
                }
            }
        }
    },
    data() {
        return {
            // 默认的表格配置
            woptions: {
                stripe: true,
                border: false,
                fit: true,
                mutiSelect: false,
                index: true,
                isDrag: '0',
                showHeader: true,
                indexFixedLeft: false,
                checkSelect() {
                    return true
                }
            },
            // 默认的分页配置
            wpagination: {
                pagesize: 10,
                background: true,
                currentPage: 1,
                pageArr: [10, 20, 50, 100]
            },
            loading: false
        }
    },
    watch: {
        isLoading(newVal) {
            this.loading = newVal
        },
        'pagination.currentPage'(newVal) {
            this.wpagination.currentPage = newVal
        }
    },
    created() {
        // 扩展配置，目的是引用组件不用把配置全写一遍
        this.woptions = Object.assign({}, this.woptions, this.options)
        this.wpagination = Object.assign({}, this.wpagination, this.pagination)
    },
    methods: {
        // 表格多选
        handleSelectionChange(val) {
            this.$emit('handleSelectionChange', val)
        },
        // 选择每页展示的条数
        handleSizeChange(size) {
            this.$emit('handleSizeChange', size)
        },
        // 点击第几页
        handleCurrentChange(currentPage) {
            this.$emit('handleCurrentChange', currentPage)
        },
        // 表格 expand只打开一个
        expandSelect(row, expandRows) {
            this.$emit('expandSelect', row, expandRows)
        },
        // 行点击事件
        handleRowClick(row) {
            this.$emit('handleRowClick', row)
        }
    }
}
</script>

<style lang="scss" scoped>
.wTable {
    box-shadow: 0 0 10px #eee;
    .toolBar {
        padding: 10px;
        overflow: hidden;
    }
    .pagination {
        padding: 30px 0;
        text-align: center;
    }
    #table {
        width: 100%;
    }
}
</style>
