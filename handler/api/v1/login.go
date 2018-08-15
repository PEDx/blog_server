package v1

import (
	"blog_server/handler"
	"blog_server/models"
	"blog_server/pkg/auth"
	"blog_server/pkg/errno"
	"blog_server/pkg/token"

	"github.com/astaxie/beego/validation"
	"github.com/gin-gonic/gin"
	"github.com/lexkong/log"
)

func Login(c *gin.Context) {
	var r models.CreateRequest
	data := make(map[string]interface{})

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

	u, err := models.GetUserByName(r.Username)
	if err != nil {
		handler.SendResponse(c, errno.ErrUserNotFound, nil)
		return
	}

	if err := auth.Compare(u.Password, r.Password); err != nil {
		handler.SendResponse(c, errno.ErrPasswordIncorrect, nil)
		return
	}

	t, err := token.Sign(c, token.Context{ID: uint64(u.ID), Username: u.Username}, "")
	if err != nil {
		handler.SendResponse(c, errno.ErrToken, nil)
		return
	}

	data["token"] = t

	handler.SendResponse(c, nil, data)
}
