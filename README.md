# 残差计算器网站 (Residual Calculator)

一个专业的在线残差计算器网站，以"how to calculate residual"为核心关键词，提供完整的残差分析工具和教育资源。

## 🎯 项目特点

- **多种残差计算**: 支持基础、标准化、学生化残差计算
- **批量处理**: 可处理多组数据，导出计算结果
- **教育资源**: 完整的定义、公式和实例教程
- **响应式设计**: 完美适配桌面端和移动端
- **SEO优化**: 针对搜索引擎优化，易于发现
- **数学公式渲染**: 使用MathJax渲染数学公式

## 📁 项目结构

```
残差计算器/
├── index.html                 # 首页
├── definition/
│   └── index.html             # 残差定义页面
├── formulas/
│   └── index.html             # 数学公式页面
├── calculator/
│   └── index.html             # 计算器页面
├── examples/
│   └── index.html             # 实例教程页面
├── assets/
│   ├── css/
│   │   ├── styles.css         # 主样式文件
│   │   └── calculator.css     # 计算器专用样式
│   └── js/
│       ├── main.js            # 主要JavaScript功能
│       ├── calculator.js      # 计算器逻辑
│       └── calculator-tabs.js # 标签页切换功能
├── sitemap.xml               # 网站地图
├── robots.txt               # 搜索引擎规则
└── README.md               # 项目说明文档
```

## 🚀 功能特性

### 计算器功能
- **基础残差计算**: e = y - ŷ
- **标准化残差**: r = e / s
- **学生化残差**: t = e / (s√(1-h))
- **批量数据处理**: 支持多组数据同时计算
- **结果导出**: CSV和JSON格式导出

### 教育内容
- **残差定义**: 详细的概念解释和实际意义
- **数学公式**: 完整的公式推导和应用场景
- **实例教程**: 真实案例的步骤详解
- **诊断指导**: 模型检验和异常值检测

### 技术特性
- **响应式设计**: 移动端友好
- **现代CSS**: 使用CSS Grid和Flexbox
- **原生JavaScript**: 无框架依赖，快速加载
- **数学渲染**: MathJax支持复杂数学公式
- **SEO优化**: 完整的meta标签和结构化数据

## 🛠️ 技术栈

- **HTML5**: 语义化标签结构
- **CSS3**: 现代样式和响应式设计
- **JavaScript (ES6+)**: 原生JavaScript，无外部依赖
- **MathJax**: 数学公式渲染

## 📱 响应式设计

### 断点设置
- **移动端**: < 768px
- **平板端**: 768px - 1024px
- **桌面端**: > 1024px

### 移动端优化
- 单列布局，垂直堆叠
- 触控友好的按钮设计 (最小44px)
- 数字键盘自动调用
- 优化的导航菜单

## 🔍 SEO优化

### 关键词策略
**主关键词:**
- how to calculate residual
- residual calculator
- residual calculation

**长尾关键词:**
- standardized residual calculation
- studentized residual formula
- regression residual analysis

### 技术SEO
- 语义化HTML结构
- 优化的meta标签
- XML网站地图
- Robots.txt配置
- 页面加载速度优化

## 🚀 安装和运行

### 1. 直接运行
```bash
# 克隆或下载项目文件
# 使用任何HTTP服务器运行

# 使用Python简单服务器
python -m http.server 8000

# 使用Node.js http-server
npx http-server

# 使用PHP内置服务器
php -S localhost:8000
```

### 2. 访问网站
打开浏览器访问 `http://localhost:8000`

## 🌐 部署指南

### 静态网站托管
网站是纯静态的，可以部署到任何静态托管服务：

- **Netlify**: 拖拽文件夹即可部署
- **Vercel**: 连接Git仓库自动部署
- **GitHub Pages**: 免费静态网站托管
- **AWS S3**: 企业级静态网站托管

### 部署步骤 (以Netlify为例)
1. 将所有文件打包成ZIP文件
2. 登录Netlify控制面板
3. 拖拽ZIP文件到部署区域
4. 等待部署完成
5. 配置自定义域名 (可选)

## 📊 使用说明

### 基础计算器
1. 在首页输入观测值和预测值
2. 点击"Calculate Residual"按钮
3. 查看计算结果和解释

### 高级计算器
1. 访问 `/calculator/` 页面
2. 选择所需的残差类型标签页
3. 输入相应的参数
4. 获得详细的计算结果

### 批量计算
1. 在计算器页面选择"Batch Calculator"标签
2. 添加多行数据
3. 点击"Calculate All Residuals"
4. 查看汇总统计和详细结果
5. 可导出为CSV或JSON格式

## 🎨 自定义配置

### 颜色主题
在 `assets/css/styles.css` 中修改CSS变量：
```css
:root {
  --primary-color: #2563eb;      /* 主色调 */
  --secondary-color: #64748b;    /* 辅助色 */
  --accent-color: #059669;       /* 强调色 */
  /* ... 其他颜色变量 */
}
```

### 添加新功能
1. 在相应的HTML文件中添加界面元素
2. 在JavaScript文件中添加功能逻辑
3. 在CSS文件中添加样式规则

## 📈 SEO监控

### 推荐工具
- **Google Search Console**: 监控搜索表现
- **Google Analytics**: 分析用户行为
- **PageSpeed Insights**: 检查页面速度
- **Schema.org Validator**: 验证结构化数据

### 关键指标
- 页面加载速度 < 3秒
- 移动端友好度评分 > 95
- Core Web Vitals 达标
- 搜索引擎收录率

## 🔧 维护和更新

### 定期检查
- 检查外部链接有效性
- 更新MathJax版本
- 监控页面加载性能
- 检查移动端兼容性

### 内容更新
- 定期添加新的计算实例
- 更新公式说明和解释
- 添加用户常见问题解答

## 📝 许可证

MIT License - 可自由使用、修改和分发。

## 🤝 贡献

欢迎提交Issue和Pull Request来改进项目。

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 项目Issues
- 邮件联系

---

**注意**: 部署前请确保所有外部CDN链接（如MathJax）可正常访问，并考虑本地化部署以提高加载速度。 