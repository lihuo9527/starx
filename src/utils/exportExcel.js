
export const exportExcel = (id, name) => {

    const exportFileContent = document.getElementById(id).outerHTML;
    console.log(exportFileContent);

    let blob = new Blob([exportFileContent], { type: "text/plain;charset=utf-8" });
    blob = new Blob([String.fromCharCode(0xFEFF), blob], { type: blob.type });

    const link = window.URL.createObjectURL(blob);
    const a = document.createElement("a");    // 创建a标签
    a.download = name;  // 设置被下载的超链接目标（文件名）   建议文件后缀为 .xls
    a.href = link;                            // 设置a标签的链接
    document.body.appendChild(a);            // a标签添加到页面
    a.click();                                // 设置a标签触发单击事件
    document.body.removeChild(a);            // 移除a标签
}