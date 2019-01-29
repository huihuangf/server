const Koa=require('koa')
const Router =require('koa-router')
let server=new Koa()
server.listen(8081)
let router=new Router()

router.use('./api',require('./routers/api'))
server.use(router.routes());