package models

import (
	"time"

	"github.com/jinzhu/gorm"
)

type TagModel struct {
	Model

	Name       string `json:"name"`
	CreatedBy  string `json:"created_by"`
	ModifiedBy string `json:"modified_by"`
	State      int    `json:"state"`
}

type GetTagRes struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	State string `json:"state"`
}

func (c *TagModel) TableName() string {
	return "blog_tag"
}

func (c *GetTagRes) TableName() string {
	return "blog_tag"
}

func (tag *TagModel) BeforeCreate(scope *gorm.Scope) error {
	scope.SetColumn("CreatedOn", time.Now().Unix())

	return nil
}

func (tag *TagModel) BeforeUpdate(scope *gorm.Scope) error {
	scope.SetColumn("ModifiedOn", time.Now().Unix())

	return nil
}

func GetTags(pageNum int, pageSize int, maps interface{}) (tags []GetTagRes) {
	db.Where(maps).Offset(pageNum).Limit(pageSize).Find(&tags)

	return
}

func GetTagTotal(maps interface{}) (count int) {
	db.Model(&TagModel{}).Where(maps).Count(&count)

	return
}

func ExistTagByName(name string) bool {
	var tag TagModel
	db.Select("id").Where("name = ?", name).First(&tag)
	if tag.ID > 0 {
		return true
	}

	return false
}

func ExistTagByID(id int) bool {
	var tag TagModel
	db.Select("id").Where("id = ?", id).First(&tag)
	if tag.ID > 0 {
		return true
	}

	return false
}

func AddTag(name string, state int, createdBy string) bool {
	db.Create(&TagModel{
		Name:      name,
		State:     state,
		CreatedBy: createdBy,
	})

	return true
}

func DeleteTag(id int) bool {
	db.Where("id = ?", id).Delete(&TagModel{})

	return true
}

func EditTag(id int, data interface{}) bool {
	db.Model(&TagModel{}).Where("id = ?", id).Updates(data)

	return true
}
