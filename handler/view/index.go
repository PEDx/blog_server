package view

import (
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

func Index(c *gin.Context) {

	session := sessions.Default(c)
	var login bool
	v := session.Get("login")
	u := session.Get("username")

	if v == nil {
		login = false
	} else {
		login = v.(bool)
	}

	if login && u != nil {
		c.HTML(http.StatusOK, "index.html", gin.H{
			"title": u,
			"name":  u,
			"icon":  "https://avatars3.githubusercontent.com/u/16054017?s=60&v=4",
		})
	} else {
		c.HTML(http.StatusOK, "index.html", gin.H{"user": "noLogin"})
	}

	return

}
