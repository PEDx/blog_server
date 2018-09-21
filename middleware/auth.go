package middleware

import (
	"blog_server/pkg/token"
	"net/http"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Parse the json web token.
		if _, err := token.ParseRequest(c); err != nil {
			c.Redirect(http.StatusMovedPermanently, "/login")
			return
		}

		c.Next()
	}
}
