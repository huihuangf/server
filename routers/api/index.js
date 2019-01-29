const Router =require('koa-router')
let router=new Router()

router.get('/account_catalog',async ctx=>{
    ctx.body=['娱乐','汽车','情感','美食','时尚']
});

module.exports=router.routes
