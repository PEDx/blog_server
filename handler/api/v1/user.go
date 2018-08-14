package v1

import (
	"blog_server/handler"
	"blog_server/models"
	"blog_server/pkg/auth"
	"blog_server/pkg/errno"

	"github.com/gin-gonic/gin"
	"github.com/lexkong/log"
)

// GetUser 获取用户
func GetUser(c *gin.Context) {

}

// GetUserList 获取用户列表
func GetUserList(c *gin.Context) {

}

// AddUser 添加用户
func AddUser(c *gin.Context) {
	log.Info("User Create function called.")
	var r models.CreateRequest

	if err := c.Bind(&r); err != nil {
		handler.SendResponse(c, errno.ErrBind, nil)
		return
	}

	pwd, err := auth.Encrypt(r.Password)

	if err != nil {
		handler.SendResponse(c, errno.ErrEncrypt, nil)
		return
	}

	u := models.UserModel{
		Username: r.Username,
		Password: pwd,
	}

	if err := u.Create(); err != nil {
		handler.SendResponse(c, errno.ErrUser, nil)
		return
	}

	rep := models.GetUserRes{
		Username: u.Username,
	}

	handler.SendResponse(c, nil, rep)
}

// EditUser 编辑用户
func EditUser(c *gin.Context) {

}

// DeleteUser 删除用户
func DeleteUser(c *gin.Context) {

}
