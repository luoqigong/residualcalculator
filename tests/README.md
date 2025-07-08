# 残差计算器 - 自动测试套件

## 概述

这是一个全面的自动测试套件，涵盖了残差计算器网站的所有方面，包括：

- **单元测试** - 测试计算方法的准确性
- **UI交互测试** - 测试用户界面交互功能
- **端到端测试** - 测试完整的用户流程
- **响应式测试** - 测试移动端和桌面端适配
- **性能测试** - 测试加载速度和计算性能

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 安装浏览器（用于端到端测试）

```bash
npm run install-browsers
```

### 3. 运行所有测试

```bash
npm run test:all
```

## 📋 测试命令

### 单元测试
```bash
# 运行单元测试
npm run test

# 监听模式运行
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

### 端到端测试
```bash
# 运行所有E2E测试
npm run test:e2e

# 带浏览器窗口运行（调试模式）
npm run test:e2e:headed

# 调试模式
npm run test:e2e:debug
```

### 自动化测试运行器
```bash
# 运行完整的自动化测试套件
node tests/run-tests.js
```

## 🧪 测试覆盖范围

### ✅ 计算方法测试

#### 基础残差计算
- [x] 正残差计算 (observed > predicted)
- [x] 负残差计算 (observed < predicted)
- [x] 零残差计算 (observed = predicted)
- [x] 小数值精度测试
- [x] 大数值处理
- [x] 边界值测试

#### 标准化残差计算
- [x] 标准标准化残差
- [x] 零标准误差错误处理
- [x] 极小标准误差测试
- [x] 负残差标准化

#### 学生化残差计算
- [x] 标准学生化残差
- [x] 高杠杆值处理
- [x] 杠杆值边界检测
- [x] 复杂参数组合

#### 统计测量
- [x] 残差平方和 (RSS)
- [x] 均方误差 (MSE)
- [x] 汇总统计
- [x] 空数组处理

### ✅ UI交互测试

#### 导航功能
- [x] 移动端汉堡菜单
- [x] 桌面端导航链接
- [x] 菜单点击外部关闭
- [x] 键盘导航支持

#### 表单交互
- [x] 快速计算器提交
- [x] 输入验证
- [x] 错误状态显示
- [x] 清除功能

#### 标签页切换
- [x] 计算器标签切换
- [x] 活动状态管理
- [x] 内容显示切换

#### 批量计算
- [x] 添加行功能
- [x] 删除行功能
- [x] 行号更新

### ✅ 端到端测试

#### 首页测试
- [x] 页面加载成功
- [x] 导航菜单功能
- [x] 移动端导航
- [x] 快速计算器
- [x] 输入验证
- [x] 不同数字格式处理
- [x] 特性卡片显示
- [x] 快速链接功能
- [x] 数学公式渲染
- [x] SEO元标签检查

#### 计算器页面测试
- [x] 页面加载
- [x] 标签页切换
- [x] 基础残差计算
- [x] 标准化残差计算
- [x] 学生化残差计算
- [x] 批量计算处理
- [x] 结果导出（CSV）
- [x] 输入验证
- [x] 错误处理
- [x] 结果解释
- [x] 清除功能
- [x] 剪贴板复制

### ✅ 响应式设计测试

#### 设备适配
- [x] iPhone SE (375×667)
- [x] iPhone 12 (390×844)
- [x] Samsung Galaxy S8+ (360×740)
- [x] iPad (768×1024)
- [x] iPad Pro (1024×1366)
- [x] Desktop (1200×800)
- [x] Large Desktop (1920×1080)

#### 移动端优化
- [x] 触控目标大小（≥44px）
- [x] 表单元素适配
- [x] 字体大小（≥16px防缩放）
- [x] 水平滚动检查
- [x] 内容溢出检测

#### 跨设备兼容性
- [x] 功能一致性
- [x] 方向变化适配
- [x] 性能表现
- [x] 键盘导航
- [x] 对比度检查

### ✅ 性能测试

#### 加载性能
- [x] 首页加载时间 (<2s DOMContentLoaded)
- [x] 完整加载时间 (<4s)
- [x] Core Web Vitals
  - FCP < 1.8s
  - LCP < 2.5s
  - CLS < 0.1

#### 计算性能
- [x] 单次计算速度 (<500ms)
- [x] 批量计算效率 (51行 <5s)
- [x] 复杂计算优化 (<1s)
- [x] 大数据集处理

#### 资源优化
- [x] 内存使用 (<50MB)
- [x] DOM节点数量 (<2000)
- [x] CSS文件大小 (<100KB)
- [x] JS文件大小 (<200KB)

#### 用户体验
- [x] 快速交互响应
- [x] 平滑滚动
- [x] 布局稳定性
- [x] 无控制台错误

## 📊 测试报告

运行测试后，会在 `test-results/` 目录生成详细报告：

- `test-report.html` - 可视化HTML报告
- `test-report.json` - 机器可读的JSON报告
- `screenshots/` - 响应式测试截图
- Playwright报告在 `playwright-report/`

## 🔧 配置文件

- `package.json` - npm脚本和依赖
- `playwright.config.js` - Playwright配置
- `tests/setup.js` - Jest设置文件
- `tests/run-tests.js` - 自动化测试运行器

## 🐛 调试测试

### 调试单元测试
```bash
npm run test:watch
```

### 调试E2E测试
```bash
npm run test:e2e:debug
```

### 查看浏览器运行
```bash
npm run test:e2e:headed
```

## 📱 浏览器支持

测试覆盖以下浏览器：
- Chromium (包括 Chrome, Edge)
- Firefox
- WebKit (Safari)
- 移动端 Chrome
- 移动端 Safari

## ⚡ 持续集成

此测试套件可以轻松集成到CI/CD流水线中：

```yaml
# GitHub Actions 示例
- name: Install dependencies
  run: npm install

- name: Install Playwright browsers
  run: npx playwright install

- name: Run tests
  run: node tests/run-tests.js

- name: Upload test results
  uses: actions/upload-artifact@v3
  with:
    name: test-results
    path: test-results/
```

## 🎯 测试最佳实践

1. **隔离性** - 每个测试独立运行，不依赖其他测试
2. **可重复性** - 测试结果一致，不受外部因素影响
3. **快速反馈** - 单元测试快速执行，及时发现问题
4. **真实场景** - E2E测试模拟真实用户操作
5. **性能监控** - 持续监控加载和计算性能
6. **跨浏览器** - 确保所有主流浏览器兼容性

## 🔄 维护和更新

定期更新测试用例以确保：
- 新功能有对应测试覆盖
- 测试数据反映真实使用场景
- 性能基准跟上技术发展
- 浏览器版本兼容性更新

## 📞 支持

如果在运行测试时遇到问题：

1. 检查Node.js版本 (推荐 16+)
2. 确保Python可用 (用于本地服务器)
3. 清除node_modules重新安装
4. 检查端口8000是否被占用

更多技术支持请参考项目README或提交Issue。 