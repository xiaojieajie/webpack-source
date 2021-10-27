const fs = require('fs')
const options = require('./webpack.config')
const parser = require('@babel/parser') // 1
const traverse = require('@babel/traverse').default // 2
const { transformFromAst } = require('@babel/core')
const path = require('path')

const Parser = {
  getAst: path => {
    // 读取入口文件
    const content = fs.readFileSync(path, 'utf-8')
    // 将文件内容转化为AST
    return parser.parse(content, {
      sourceType: 'module'
    })
  },
  getDependecies: (ast, filename) => {
    const dependecies = {}
    // 遍历所有的import模块，存入dependecies
    traverse(ast, {
      ImportDeclaration({ node }) {
        const dirname = path.dirname(filename)
        // 保存依赖模块路径，之后生成依赖关系图需要用到
        const filepath = './' + path.join(dirname, node.source.value)
        dependecies[node.source.value] = filepath
      }
    })
    return dependecies
  },
  getCode: ast => {
    const { code } = transformFromAst(ast, null, {
      presets: ['@babel/preset-env']
    })
    return code
  }
}


class Compiler {
  constructor(options) {
    // webpack配置
    const { entry, output } = options
    // 入口
    this.entry = entry
    // 出口
    this.output = output
    // 模块
    this.modules = []
  }

  // 构建启动
  run() {
    const info = this.build(this.entry)
    this.modules.push(info)
    this.modules.forEach(({ dependecies }) => {
      if (!dependecies) return
      for (const dependency in dependecies) {
        console.log(dependency)
        this.modules.push(this.build(dependecies[dependency]))
      }
    })
    // 生成依赖关系图
    const dependencyGraph = this.modules.reduce((graph, item) => ({
      ...graph,
      [item.filepath]: {
        dependecies: item.dependecies,
        code: item.code
      }
    }), {})
    this.generate(dependencyGraph)
  }

  build(filepath) {
    const { getAst, getDependecies, getCode } = Parser
    const ast = getAst(filepath)
    const dependecies = getDependecies(ast, filepath)
    const code = getCode(ast)
    return {
      // 文件路径, 可以作为每个模块的唯一标识符
      filepath,
      // 依赖对象，保存着模块路径
      dependecies,
      // 文件内容
      code
    }
  }

  // 重写require函数，输出bundle
  generate(code) {
    // 输出文件路径
    const filePath = path.join(this.output.path, this.output.filename)
    const bundle = `(function(graph){
      function require(module) {
        function localRequire(relativePath) {
          return require(graph[module].dependecies[relativePath])
        }
        var exports = {};
        (function(require, exports, code) {
          eval(code)
        })(localRequire, exports, graph[module].code)
        return exports
      }
      require('${this.entry}')
    })(${JSON.stringify(code)})`
    // 把文件内容写入到文件
    fs.writeFileSync(filePath, bundle, 'utf-8')
  }
}

new Compiler(options).run()