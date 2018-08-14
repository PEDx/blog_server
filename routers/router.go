package routers

import (
	"blog_server/handler/api/v1"
	"blog_server/pkg/setting"

	"github.com/gin-gonic/gin"
)

func InitRouter() *gin.Engine {
	r := gin.New()

	r.Use(gin.Logger())

	r.Use(gin.Recovery())

	gin.SetMode(setting.RunMode)

	apiv1 := r.Group("/api/v1")

	{
		//获取标签列表
		apiv1.GET("/tags", v1.GetTags)
		//新建标签
		apiv1.POST("/tags", v1.AddTag)
		//更新指定标签
		apiv1.PUT("/tags/:id", v1.EditTag)
		//删除指定标签
		apiv1.DELETE("/tags/:id", v1.DeleteTag)

		// 用户列表
		apiv1.GET("/user", v1.GetUserList)
		// 用户
		apiv1.GET("/user/:id", v1.GetUser)
		// 添加用户
		apiv1.POST("/user", v1.AddUser)
		// 编辑用户
		apiv1.PUT("/user/:id", v1.EditUser)
		// 删除用户
		apiv1.DELETE("/user/:id", v1.DeleteUser)
	}

	return r
}
