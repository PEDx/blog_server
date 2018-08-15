package models

import (
	"fmt"
	"time"

	"github.com/jinzhu/gorm"
)

type UserModel struct {
	Model
	Username string `json:"username"`
	Password string `json:"password"`
}

type GetUserRespons struct {
	Model
	Username string `json:"username"`
}
type CreateRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func (u *GetUserRespons) TableName() string {
	return "blog_user"
}

func (u *UserModel) TableName() string {
	return "blog_user"
}

func (u *UserModel) BeforeCreate(scope *gorm.Scope) error {
	scope.SetColumn("CreatedOn", time.Now().Unix())

	return nil
}

func (u *UserModel) BeforeUpdate(scope *gorm.Scope) error {
	scope.SetColumn("ModifiedOn", time.Now().Unix())

	return nil
}

func (u *UserModel) Create() error {
	return db.Create(&u).Error
}

func GetUserList(pageNum int, pageSize int, username string) ([]GetUserRespons, error) {
	where := fmt.Sprintf("username like '%%%s%%'", username)
	users := []GetUserRespons{}
	d := db.Where(where).Offset(pageNum).Limit(pageSize).Find(&users)

	return users, d.Error
}
func GetUserTotal(username string) (count int) {
	where := fmt.Sprintf("username like '%%%s%%'", username)
	db.Model(&UserModel{}).Where(where).Count(&count)

	return
}

func GetUserById(id int) (GetUserRespons, error) {
	var u GetUserRespons
	d := db.Where("id = ?", id).First(&u)
	return u, d.Error
}

func DeleteUserById(id int) error {
	user := UserModel{}
	user.Model.ID = id
	return db.Delete(&user).Error
}

func ExistUserByID(id int) bool {
	var u GetUserRespons
	db.Select("id").Where("id = ?", id).First(&u)
	if u.ID > 0 {
		return true
	}
	return false
}

func EditUser(id int, data interface{}) error {
	return db.Model(&UserModel{}).Where("id = ?", id).Updates(data).Error
}
