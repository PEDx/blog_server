package v1

import (
	. "blog_server/handler"
	"blog_server/models"
	"blog_server/pkg/errno"
	"blog_server/pkg/setting"
	"blog_server/pkg/utils"

	"github.com/Unknwon/com"
	"github.com/astaxie/beego/validation"
	"github.com/gin-gonic/gin"
	"github.com/lexkong/log"
)

//获取多个文章标签
func GetTags(c *gin.Context) {
	name := c.Query("name")

	maps := make(map[string]interface{})
	data := make(map[string]interface{})

	if name != "" {
		maps["name"] = name
	}

	var state int = -1
	if arg := c.Query("state"); arg != "" {
		state = com.StrTo(arg).MustInt()
		maps["state"] = state
	}

	err := errno.OK

	data["lists"] = models.GetTags(utils.GetPage(c), setting.PageSize, maps)
	data["total"] = models.GetTagTotal(maps)

	SendResponse(c, err, data)
}

//新增文章标签
func AddTag(c *gin.Context) {
	name := c.Query("name")
	state := com.StrTo(c.DefaultQuery("state", "0")).MustInt()
	createdBy := c.Query("created_by")

	valid := validation.Validation{}
	valid.Required(name, "name").Message("名称不能为空")
	valid.MaxSize(name, 100, "name").Message("名称最长为100字符")
	valid.Required(createdBy, "created_by").Message("创建人不能为空")
	valid.MaxSize(createdBy, 100, "created_by").Message("创建人最长为100字符")
	valid.Range(state, 0, 1, "state").Message("状态只允许0或1")

	err := errno.ErrValidation

	if !valid.HasErrors() {
		if !models.ExistTagByName(name) {
			err = errno.OK
			models.AddTag(name, state, createdBy)
		} else {
			err = errno.ErrTagExist
		}
	} else {
		for _, e := range valid.Errors {
			log.Infof(e.Key, e.Message)
		}
	}

	SendResponse(c, err, make(map[string]string))
}

//修改文章标签
func EditTag(c *gin.Context) {
	id := com.StrTo(c.Param("id")).MustInt()
	name := c.Query("name")
	modifiedBy := c.Query("modified_by")

	valid := validation.Validation{}

	var state int = -1
	if arg := c.Query("state"); arg != "" {
		state = com.StrTo(arg).MustInt()
		valid.Range(state, 0, 1, "state").Message("状态只允许0或1")
	}

	valid.Required(id, "id").Message("ID不能为空")
	valid.Required(modifiedBy, "modified_by").Message("修改人不能为空")
	valid.MaxSize(modifiedBy, 100, "modified_by").Message("修改人最长为100字符")
	valid.MaxSize(name, 100, "name").Message("名称最长为100字符")

	err := errno.ErrValidation
	if !valid.HasErrors() {
		err = errno.OK
		if models.ExistTagByID(id) {
			data := make(map[string]interface{})
			data["modified_by"] = modifiedBy
			if name != "" {
				data["name"] = name
			}
			if state != -1 {
				data["state"] = state
			}

			models.EditTag(id, data)
		} else {
			err = errno.ErrTagExist
		}
	} else {
		for _, err := range valid.Errors {
			log.Infof(err.Key, err.Message)
		}
	}

	SendResponse(c, err, make(map[string]string))
}

//删除文章标签
func DeleteTag(c *gin.Context) {
	id := com.StrTo(c.Param("id")).MustInt()

	valid := validation.Validation{}
	valid.Min(id, 1, "id").Message("ID必须大于0")

	err := errno.ErrValidation
	if !valid.HasErrors() {
		err = errno.OK
		if models.ExistTagByID(id) {
			models.DeleteTag(id)
		} else {
			err = errno.ErrTagNotExist
		}
	} else {
		for _, err := range valid.Errors {
			log.Infof(err.Key, err.Message)
		}
	}

	SendResponse(c, err, make(map[string]string))
}
