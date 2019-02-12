const Router =require('koa-router')
const re=require('../../lib/re')
const guid=require('uuid/v4')
const config=require('../../config')
let router=new Router()


router.get('/account_catalog',async ctx=>{
    ctx.body=['娱乐','汽车','情感','美食','时尚']
});

router.get('/get_province',async ctx=>{
ctx.body=await ctx.db.query('select * from province')
});
router.get('/get_city/:proid/',async ctx=>{
    let {proid}=ctx.params;
    ctx.body=await ctx.db.query('select * from city where proID=?',proid)
});

router.post('/reg',async ctx=>{
    //console.log(ctx.request.fields);
    //console.log("files:"+ctx.request.files)
    let post=ctx.request.fields;
    if(!re.email.test(post['email'])){
        ctx.body={err:1,msg:'email is incorrect'}
    }else{
        await ctx.db.query(
            "INSERT INTO user_table (email, password, type, display_name, slogan, catalog, icon, description, other_channels, name, identify_number, province, city, qq_wx, recommend_code, token, token_expires) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [post['email'], post['password'], post['type'], post['display_name'], post['slogan'], post['catalog'], post['icon'], post['description'], post['other_channels'], post['name'], post['identify_number'], post['province'], post['city'], post['qq_wx'], post['recommend_code'], '', 0]
          );
        ctx.body={err:0}
    }


})

router.post('/login',async ctx=>{
    let {email,password}=ctx.request.fields;
    let rows=await ctx.db.query('select * from user_table where email=?',[email])
    if(rows.length==0){
        ctx.body={err:1,msg:'no this user'}
    }else{
        let row=rows[0];
        if(row['password']!=password){
            ctx.body={err:1,msg:'password is error'}
        }else{
             token=guid().replace(/\-/g,'');
             token_expires=Math.floor((Date.now()+config.TOKEN_AGE)/1000)
             await ctx.db.query('update user_table set token=?,token_expires=?',[token,token_expires])
             ctx.body={err:0,token}
            }

    }
})

//发文章
router.post('/publish',async ctx=>{
    //console.log(ctx.request.fields)
    let post=ctx.request.fields;
   // console.log(post['catalogs'])
    let token=post['token'];
    let rows=await ctx.db.query('select ID,token_expires FROM user_table where token=?',[token]);
    if(!rows.length){
        ctx.body={err:1,msg:'need login'}
    }else{
        let {ID,token_expires}=rows[0];
        let now=Math.floor(Date.now()/1000);
        if(now>token_expires){
            ctx.body={err:1,msg:'token expired'}
        }else{
            let catalogs=post['catalogs'].join(',')
            //验证权限
            await ctx.db.query('INSERT INTO article_table (title,content,catalogs,cover,userID,post_time,review) VALUES (?,?,?,?,?,?,?)',
            [
                post['title'], post['content'], catalogs, post['cover'],ID,now,0
            ])

            ctx.body={err:0}

        }
    }


})

router.get('/catalog/:parent',async ctx=>{
    let {parent}=ctx.params;
    ctx.body= await ctx.db.query('select ID,title from catalog_table where parentID=?',[parent]);

})

module.exports=router.routes()
