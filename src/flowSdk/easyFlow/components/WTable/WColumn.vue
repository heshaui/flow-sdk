<template>
    <el-table-column
        v-if="!column.isHide"
        :prop="column.prop"
        :label="column.label"
        :type="column.type"
        :min-width="column.minWidth"
        :width="column.width"
        :align="column.align"
        :fixed="column.fixed"
        :show-overflow-tooltip="column.tooltip"
        :class-name="column.class"
        :sortable="column.sort"
    >
        <!-- 数据列 -->
        <template v-for="(item, key) of column.children">
            <template v-if="item.children && item.children.length > 0">
                <WColumn :key="key" :column="item" />
            </template>
            <template v-else>
                <!-- 具名插槽 -->
                <slot v-if="item.slot" :name="item.slot" />
                <el-table-column
                    v-else-if="!item.isHide"
                    v-slot="scope"
                    :key="key"
                    :prop="item.prop"
                    :label="item.label"
                    :type="item.type"
                    :min-width="item.minWidth"
                    :width="item.width"
                    :align="item.align"
                    :fixed="item.fixed"
                    :show-overflow-tooltip="item.tooltip"
                    :class-name="item.class"
                    :sortable="item.sort"
                >
                    <!-- 是否需要特殊处理 -->
                    <template v-if="item.formatter">
                        <span v-html="item.formatter(scope.row, item)" />
                    </template>
                    <template v-else>
                        <!-- 正常显示 -->
                        <span>{{ scope.row[item.prop] }}</span>
                    </template>
                </el-table-column>
            </template>
        </template>
    </el-table-column>
</template>

<script>
export default {
    name: 'WColumn',
    props: {
        column: {
            type: Object,
            default() {
                return {}
            }
        }
    }
}
</script>
