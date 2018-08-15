package v1

import (
	"blog_server/handler"
	"blog_server/models"
	"blog_server/pkg/auth"
	"blog_server/pkg/errno"
	"blog_server/pkg/setting"
	"blog_server/pkg/utils"

	"github.com/Unknwon/com"
	"github.com/astaxie/beego/validation"
	"github.com/gin-gonic/gin"
	"github.com/lexkong/log"
)

// GetUser 获取用户信息
func GetUser(c *gin.Context) {
	id := com.StrTo(c.Query("id")).MustInt()

	u, err := models.GetUserById(id)

	if err != nil {
		handler.SendResponse(c, errno.ErrUserNotFound, nil)
		return
	}

	handler.SendResponse(c, nil, u)
}

// GetUserList 获取用户列表
func GetUserList(c *gin.Context) {
	username := c.Param("username")

	data := make(map[string]interface{})

	list, err := models.GetUserList(utils.GetPage(c), setting.PageSize, username)

	if err != nil {
		handler.SendResponse(c, errno.ErrDatabase, nil)
		return
	}

	data["lists"] = list

	data["total"] = models.GetUserTotal(username)

	handler.SendResponse(c, nil, data)
}

// AddUser 添加用户
func AddUser(c *gin.Context) {
	log.Info("User Create function called.")
	var r models.CreateRequest
	data := make(map[string]string)

	if err := c.Bind(&r); err != nil {
		handler.SendResponse(c, errno.ErrBind, nil)
		return
	}

	valid := validation.Validation{}
	valid.Required(r.Username, "username").Message("名称不能为空")
	valid.MaxSize(r.Username, 50, "username").Message("名称最长为50字符")
	valid.Required(r.Password, "password").Message("密码不能为空")
	valid.MaxSize(r.Password, 20, "password").Message("密码最长为20字符")
	valid.MinSize(r.Password, 6, "password").Message("密码最短为6字符")

	if valid.HasErrors() {
		handler.SendResponse(c, errno.ErrValidation, nil)
		for _, e := range valid.Errors {
			log.Infof(e.Message)
		}
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
		handler.SendResponse(c, errno.ErrDatabase, nil)
		return
	}

	data["username"] = u.Username

	handler.SendResponse(c, nil, data)
}

// EditUser 编辑用户
func EditUser(c *gin.Context) {
	var r models.CreateRequest

	id := com.StrTo(c.Param("id")).MustInt()
	data := make(map[string]interface{})

	if err := c.Bind(&r); err != nil {
		handler.SendResponse(c, errno.ErrBind, nil)
		return
	}

	valid := validation.Validation{}
	valid.Required(id, "id").Message("id不能为空")
	if r.Username != "" {
		valid.MaxSize(r.Username, 50, "username").Message("名称最长为50字符")
	}
	if r.Password != "" {
		valid.MaxSize(r.Password, 20, "password").Message("密码最长为20字符")
		valid.MinSize(r.Password, 6, "password").Message("密码最短为6字符")
	}

	if valid.HasErrors() {
		handler.SendResponse(c, errno.ErrValidation, nil)
		for _, e := range valid.Errors {
			log.Infof(e.Message)
		}
		return
	}

	if r.Password != "" {
		pwd, err := auth.Encrypt(r.Password)
		if err != nil {
			handler.SendResponse(c, errno.ErrEncrypt, nil)
			return
		}
		data["password"] = pwd
	}

	if r.Username != "" {
		data["username"] = r.Username
	}

	if err := models.EditUser(id, data); err != nil {
		handler.SendResponse(c, errno.ErrUserUpdate, nil)
		return
	}

	handler.SendResponse(c, nil, nil)
}

// DeleteUser 删除用户
func DeleteUser(c *gin.Context) {
	id := com.StrTo(c.Param("id")).MustInt()

	valid := validation.Validation{}
	valid.Required(id, "id").Message("id不能为空")

	if valid.HasErrors() {
		handler.SendResponse(c, errno.ErrValidation, nil)
		for _, e := range valid.Errors {
			log.Infof(e.Message)
		}
		return
	}

	if !models.ExistUserByID(id) {
		handler.SendResponse(c, errno.ErrUserNotFound, nil)
		return
	}

	if err := models.DeleteUserById(id); err != nil {
		handler.SendResponse(c, errno.ErrDatabase, nil)
		return
	}

	handler.SendResponse(c, nil, nil)
}
