let text = `
#apple #pie, tasty, #good special offer, #中文, #打字
table-tennis, table tennis, football
#table-tennis, #table tennis, #football
`

// //map用法參考：https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Array/map
// //filter用法參考：https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
// //flatmap可將2D array換成1D array
// function extractTag(text){
//     let parts = text
//         .split('\n')
//         .map(part => part.trim())
//         .filter(part => part.length>1)
//         .flatMap(part => part.split('#'))
//     return parts
// }

// console.log(extractTag(text))

//更新版
// function applySeperator是base on 每一parts去操作。
//return new Set (parts)這句是把重覆的略去。似乎也會重設為object。
function extractTag(text){
    function applySeperator(parts, seperator){
        return parts.flatMap(part =>
            part
                .split(seperator)
                .map(part => part.trim())
                .filter(part => part.length > 0)
        )
    }
    let parts = [text]
    parts = applySeperator(parts,'\n')
    parts = applySeperator(parts,'#')
    parts = applySeperator(parts,',')
    parts = applySeperator(parts,'，')
    parts = applySeperator(parts,'`')
    parts = parts.map(parts => parts.replace(/ /g), '-')
    return new Set (parts)
}

console.log(extractTag(text))

//142 11:34 ig server demostration

