// 是否具有该线
export function hasLine(data, from, to) {
    for (let i = 0; i < data.lineList.length; i++) {
        let line = data.lineList[i]
        if (line.from === from && line.to === to) {
            return true
        }
    }
    return false
}

// 是否含有相反的线
export function hashOppositeLine(data, from, to) {
    return hasLine(data, to, from)
}

// 获取连线
export function getConnector(jsp, from, to) {
    let connection = jsp.getConnections({
        source: from,
        target: to
    })[0]
    return connection
}

// 获取唯一标识
export function uuid() {
    return Math.random().toString(36).substr(3, 10)
}

// 将对象数组按某个属性分类
const  groupBy = (array, f) => {
    const groups = {}
    array.forEach(function(o) {
        const group = JSON.stringify(f(o))
        groups[group] = groups[group] || []
        groups[group].push(o)
    })
    return Object.keys(groups).map(function(group) {
        return groups[group]
    })
}
export function arrayGroupBy(list, groupId) {
    const sorted = groupBy(list, function(item) {
        return [item[groupId]]
    })
    return sorted
}

// 处理el-dialog的遮罩层
export function setModal(val) {
    if (val) {
        let model = document.createElement('div')
        model.className = 'modalPlus'
        model.setAttribute('tabindex', '0')
        model.setAttribute('style', 'z-index: 99990')
        document.body.appendChild(model)
        const timer = setTimeout(() => {
            const elModals = document.getElementsByClassName('v-modal')
            for(let modal of elModals) {
                modal.style.display = 'none'
            }
            clearTimeout(timer)
        })
    } else {
        let model = document.getElementsByClassName('modalPlus')[0]
        document.body.removeChild(model)
        const elModals = document.getElementsByClassName('v-modal')
        for(let modal of elModals) {
            modal.style.display = 'block'
        }
    }
}
