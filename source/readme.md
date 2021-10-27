1. 解析入口模块 entry，将其转换成AST（抽象语法树），使用@babel/parse
2. 然后使用**@babel/traverse** 去找出入口文件所有 **依赖模块**
3. 然后使用 **@babel/cord + @babel/preset-env**将入口文件的AST转换为code
4. 将2中找到的入口文件的依赖模块，进行递归，重复执行1,2,3, 生成依赖关系图
5. 重写require函数，并与4生成的**递归关系图**一起，输出到bundler中

