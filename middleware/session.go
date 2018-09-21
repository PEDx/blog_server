package middleware

import (
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

// SessionMiddleware session 中间件
func SessionMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {

		session := sessions.Default(c)
		var login bool
		v := session.Get("login")

		if v == nil {
			c.Redirect(http.StatusFound, "/login")
			return
		}

		login = v.(bool)

		if login {
			c.Next()
		} else {
			c.Redirect(http.StatusFound, "/login")
		}
	}
}
