package models

import (
	"time"

	"github.com/jinzhu/gorm"
)

type UserModel struct {
	Model
	Username string `json:"username"`
	Password string `json:"password"`
}

type GetUserRes struct {
	Username string `json:"username"`
}
type CreateRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func (u *GetUserRes) TableName() string {
	return "blog_user"
}

func (u *UserModel) TableName() string {
	return "blog_user"
}
func (u *UserModel) Create() error {
	return db.Create(&u).Error
}

func (u *UserModel) BeforeCreate(scope *gorm.Scope) error {
	scope.SetColumn("CreatedOn", time.Now().Unix())

	return nil
}

func (u *UserModel) BeforeUpdate(scope *gorm.Scope) error {
	scope.SetColumn("ModifiedOn", time.Now().Unix())

	return nil
}

func GetUserList(pageNum int, pageSize int, maps interface{}) (users []GetUserRes) {
	db.Where(maps).Offset(pageNum).Limit(pageSize).Find(&users)

	return
}

func GetPwdById(id int) (pwd string) {
	db.Select("password").Where("id = ?", id).First(&pwd)
	return
}
