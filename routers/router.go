package routers

import (
	_ "blog_server/docs"
	"blog_server/handler/api/v1"
	"blog_server/handler/view"
	"blog_server/middleware"
	"blog_server/pkg/setting"

	"github.com/gin-gonic/gin"
	"github.com/swaggo/gin-swagger"
	"github.com/swaggo/gin-swagger/swaggerFiles"
)

func InitRouter() *gin.Engine {
	r := gin.New()

	r.Use(gin.Logger())

	r.Use(middleware.Logging())

	r.Use(gin.Recovery())

	r.Static("/static", "./www/build/static")
	r.StaticFile("favicon.ico", "./www/build/favicon.ico")
	r.StaticFile("service-worker.js", "./www/build/service-worker.js")

	gin.SetMode(setting.RunMode)

	r.LoadHTMLGlob("www/build/*.html")

	apiv1 := r.Group("/api/v1")
	viewRoute := r.Group("/")
	// http.HandleFunc("/", v1.Login)
	// 用户登录
	apiv1.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	apiv1.POST("/login", v1.Login)

	apiv1.Use(middleware.AuthMiddleware())
	{
		//获取标签列表
		apiv1.GET("/tag", v1.GetTags)
		//新建标签
		apiv1.POST("/tag", v1.AddTag)
		//更新指定标签
		apiv1.PUT("/tag/:id", v1.EditTag)
		//删除指定标签
		apiv1.DELETE("/tag/:id", v1.DeleteTag)

		// 用户列表
		apiv1.GET("/user/:username", middleware.Secure, v1.GetUserList)
		// 用户
		apiv1.GET("/user", v1.GetUser)
		// 添加用户
		apiv1.POST("/user", v1.AddUser)
		// 编辑用户
		apiv1.PUT("/user/:id", v1.EditUser)
		// 删除用户
		apiv1.DELETE("/user/:id", v1.DeleteUser)
	}

	{
		viewRoute.GET("/", view.Index)
		viewRoute.GET("/blog", view.Index)
		viewRoute.GET("/home", view.Index)
		viewRoute.GET("/article", view.Index)
		viewRoute.GET("/graph", view.Index)
		viewRoute.GET("/user", view.Index)
		viewRoute.GET("/login", view.Index)
		viewRoute.GET("/tools", view.Index)
	}

	return r
}
