$(document).ready(()=>{
    // $(".menu")fadeIn(5000);

    //使用canvas的第一步，抓到html裡的canvas
    const canvas = document.querySelector('canvas')
    const c = canvas.getContext('2d')

    //困難度easy:0,normal:1,hard:2,insane:3
    var diff = 0;
    console.log(diff)

    //設定畫布大小
    canvas.width = innerWidth-10
    canvas.height = innerHeight-4

    //const scoreEl = document.querySelector('#score')
    //const startGameBtn = document.querySelector('#startGameBtn')
    //const startingBox = document.querySelector('#startingBox')
    //const bigScore = document.querySelector('#bigScore')
    //建立人物
    class Player{
        constructor(x,y,r,c){
            this.x = x
            this.y = y
            this.radius = r
            this.color = c
        }

        draw(){
            c.beginPath()   //可繪製點或線
            c.arc(this.x,this.y,this.radius,0,Math.PI*2,false) 
            c.fillStyle = this.color    //設定顏色
            c.fill()    //填色
        }
        update(){
            this.draw()
            }
    }

    //子彈
    class Projectile{
        constructor(x,y,r,c,v){
            this.x = x
            this.y = y
            this.radius = r
            this.color = c
            this.v = v
        }
        draw(){
            
            
            c.beginPath()
            c.arc(this.x,this.y,this.radius,0,Math.PI*2,false)
            c.fillStyle = this.color
            c.fill()
            
        }
        update(){
            this.draw()
            this.x = this.x + this.v.x
            this.y = this.y + this.v.y
            }
    }

    //子彈碎片
    class Particle{
        constructor(x,y,r,c,v){
            this.x = x
            this.y = y
            this.radius = r
            this.color = c
            this.v = v
            this.alpha = 1
            this.friction = 0.99
        }
        draw(){
            c.save()
            c.beginPath()
            c.globalAlpha = this.alpha
            c.arc(this.x,this.y,this.radius,0,Math.PI*2,false)
            c.fillStyle = this.color
            c.fill()
            c.restore()
        }
        update(){
            this.draw()
            this.v.x *= this.friction
            this.v.y *= this.friction
            this.x = this.x + this.v.x
            this.y = this.y + this.v.y
            this.alpha -= 0.01
        }
    }

    //敵人
    class Enemy{
        constructor(x,y,r,c,v,vc){
            this.x = x
            this.y = y
            this.radius = r
            this.color = c
            this.v = v
            this.vc = vc
        }
        draw(){
            c.beginPath()
            c.arc(this.x,this.y,this.radius,0,Math.PI*2,false)
            c.fillStyle = this.color
            c.fill()
        }
        update(){
            this.draw()
            this.x = this.x + this.v.x*this.vc
            this.y = this.y + this.v.y*this.vc
        }
    }

    //玩家位置
    var playerx = canvas.width/2
    var playery = canvas.height/2
    let player = new Player(playerx,playery,20,'white')
    let projectiles = []
    let enemies = []
    let particles = []

    function init(){
        player = new Player(playerx,playery,20,'white')

        //清空array
        projectiles = []
        enemies = []
        particles = []
        score = 0
        $("#score").text(score)
        $('#bigScore').text(score)
    }

    // const projectile = new Projectile(playerx,playery,5,'red',{x:1,y:1})
    
    var t = 0
    
    var spawnTime = 1000
    var spawnEnemyInterval
    function spawnE(){
        if(diff == 0){
            spawnTime = 1000
        }else{
            if (diff == 1) {
            spawnTime = 500
        } else {
            if(diff == 2){
                spawnTime = 200
            }else{
                spawnTime = 150
            }
            
        }} 
        spawnEnemyInterval = setInterval(()=> {
            console.log(t+=1)
            const r = Math.random() * 30 + 10
            let x
            let y
            if(Math.random() < 0.5){
                x = Math.random() < 0.5 ? 0-r : canvas.width + r
                y = Math.random() * canvas.height
            }else{
                x = Math.random() * canvas.width
                y = Math.random() < 0.5 ? 0-r : canvas.height + r
            }

            
            const c = `hsl(${Math.random()*360},50%,50%)`
            const angle = Math.atan2(player.y - y, player.x - x) 
            const v = {x : Math.cos(angle),
                    y : Math.sin(angle)
            }
            const vc = 3*Math.random()+2

            
            console.log(spawnTime)
            enemies.push(new Enemy(x,y,r,c,v,vc))},spawnTime)

    }

    let animationId
    let score = 0
    
    function animate(){
        
        animationId = requestAnimationFrame(animate)  //每1ms左右執行一次
        //console.log(enemies)
        c.fillStyle = 'rgba(0,0,0,0.1)'
        c.fillRect(0,0,canvas.width,canvas.height) //清除先前在範圍裡繪製內容(座標x,y,大小w,h)
        player.update()   //因為每次清除所以每次都要畫人物
        particles.forEach((particle,index)=>{
            if(particle.alpha <= 0){
                particles.splice(index,1)
            }else{particle.update()}
            particle.update()
        })
        //console.log(particles)
        projectiles.forEach((projectile,index) =>{
            projectile.update()

            //去除出去的子彈
            if(projectile.x - projectile.radius < 0 ||
                projectile.x + projectile.radius > canvas.width ||
                projectile.y - projectile.radius < 0 ||
                projectile.y + projectile.radius > canvas.height){
                setTimeout(()=>{
                    projectiles.splice(index,1)
                },0)
            }
        })

        player.update()   //因為每次清除所以每次都要畫人物
        //projectile.draw()
        // projectile.update()
        enemies.forEach((enemy,index)=> {
            enemy.update()
            const dist = Math.hypot(player.x - enemy.x,player.y - enemy.y)

            //被打中
            if(dist - player.radius - enemy.radius < 0){
                cancelAnimationFrame(animationId)
                $('#startingBox').toggle()
                $('#bigScore').text(score)
                clearInterval(spawnEnemyInterval);
            }

            var hitOnScore = 200
            var vanishScore = 500
        //     if(diff == 0){
        //         hitOnScore = 200
        //         vanishScore = 500
        //     }else{
        //         if (diff == 1) {
        //             hitOnScore = 100
        //             vanishScore = 400
        //     } else {
        //         if(diff == 2){
        //             hitOnScore = 100
        //             vanishScore = 400
        //         }else{
        //             hitOnScore = 100
        //             vanishScore = 500
        //         }
        //     }
        // }

            projectiles.forEach(
                (projectile,pIndex) =>{
                    const dist = Math.hypot(projectile.x - enemy.x,projectile.y - enemy.y)
                    
                    //打中
                    if(dist - enemy.radius - projectile.radius < 0){



                        for(let i = 0; i < enemy.radius * 2; i++){
                            particles.push(new Particle(projectile.x,projectile.y,
                                Math.random()*3,enemy.color,{
                                x:(Math.random()-0.5)*Math.random()*5,
                                y:Math.random()-0.5*Math.random()*5
                            }))
                        }

                        if(enemy.radius - 10 > 10){
                            //打中漸漸變小(gsap libary)
                            score += hitOnScore
                            $("#score").text(score)
                            gsap.to(enemy,{
                                radius:enemy.radius - 10
                            })
                            setTimeout(()=>{
                                projectiles.splice(pIndex,1)
                            },0)
                        }else{
                            setTimeout(()=>{
                                //remove enemy
                                score += vanishScore
                                $("#score").text(score)
                                enemies.splice(index,1)
                                projectiles.splice(pIndex,1)
                            },0)
                        }
                        
                        
                    }
                }
            )
        })

        if(score >= 10000){
            $('#wlc').html("<h1>GOOD JOB！</h1>")
            cancelAnimationFrame(animationId)
            $('#startingBox').toggle()
            $('#bigScore').text(score)
            clearInterval(spawnEnemyInterval);
        }
    }

    window.addEventListener('keydown', function(e){ //要設定步行跑出去 + 關卡(速度或出兵率)
        var keyID = e.code;
        var plyvc = 60
        if(keyID === 'KeyW' && player.y - 2*player.radius > 0)  {
            //console.log(player.y)
            gsap.to(player,{
                y:player.y - plyvc
            })
        }
        if(keyID === 'KeyS' && player.y + 2*player.radius < canvas.height)  {
            //console.log('S')
            gsap.to(player,{
                y:player.y + plyvc
            })
        }
        if(keyID === 'KeyA' && player.x - 2*player.radius > 0)  {
            //console.log('A')
            gsap.to(player,{
                x:player.x - plyvc
            })
        }
        if(keyID === 'KeyD' &&  player.x + 2*player.radius < canvas.width)  {
            //console.log('D')
            gsap.to(player,{
                x:player.x + plyvc
            })
        }
    }, false);

    addEventListener('click',(event)=>{
        //console.log(score)
        const angle = Math.atan2(event.clientY - player.y, event.clientX - player.x)
        const velocity = {
            x : Math.cos(angle)*10,
            y : Math.sin(angle)*10
        }
        projectiles.push(new Projectile(player.x,player.y,6,'red',velocity))
        
    }
    )


    //點擊
    $("#startGameBtn").click(()=>{
        init();
        animate();
        spawnE();
        t = 0
        //$('#startingBox').style.display = 'none'
        $('#startingBox').hide(200);
        $('#wlc').html("<h1>Oh no, you got hit！</h1>")
        $('#sg').hide()
        $('#sg1').hide()
        })

    $("#diffBtn").click(()=>{
        $('#startingBox').hide();
        $('#diff').fadeIn(800);
        })

    $("#controlsBtn").click(()=>{
        $('#startingBox').hide();
        $('#controls').fadeIn(800);
        })

    $("#top3Btn").click(()=>{
        $('#startingBox').hide();
        $('#top3').fadeIn(800);
        })
    
    $("#back").click(()=>{
        $('#controls').hide();
        $('#top3').hide();
        $('#startingBox').fadeIn(800);
        })

    $("#back1").click(()=>{
        $('#controls').hide();
        $('#top3').hide();
        $('#startingBox').fadeIn(800);
        })

    $("#back2").click(()=>{
        
        $('#diff').hide();
        $('#startingBox').fadeIn(800);
        })

    $("#easy").click(()=>{
        diff = 0
        console.log(diff)
        })

    $("#norm").click(()=>{
        diff = 1
        console.log(diff)
        })

    $("#hard").click(()=>{
        diff = 2
        console.log(diff)
        })

    $("#insane").click(()=>{
        diff = 3
        console.log(diff)
        })

})