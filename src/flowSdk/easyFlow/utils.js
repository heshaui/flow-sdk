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

/**
 * 创建下载方法
 */
 export function downMethod(url, name) {
    let downloadLink = document.createElement('a')
    downloadLink.href = encodeURI(url)
    downloadLink.download =  name || '' // `${name}.csv`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
}

// 校验失败后获取焦点
export function getFocus() {
    setTimeout(() => {
        var isError = document.getElementsByClassName('is-error')
        isError[0].querySelector('input').focus()
    }, 100)
    return false
}