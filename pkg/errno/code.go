package errno

var (
	// Common errors
	OK                  = &Errno{Code: 0, Message: ""}
	InternalServerError = &Errno{Code: 10001, Message: "服务端错误"}
	ErrBind             = &Errno{Code: 10002, Message: "请求体绑定错误"}

	ErrValidation = &Errno{Code: 20001, Message: "参数错误."}
	ErrDatabase   = &Errno{Code: 20002, Message: "数据库错误"}
	ErrToken      = &Errno{Code: 20003, Message: "token 错误."}
	ErrEncrypt    = &Errno{Code: 20004, Message: "加密错误."}

	// user errors
	ErrUser         = &Errno{Code: 20101, Message: "用户错误"}
	ErrUserNotFound = &Errno{Code: 20102, Message: "用户未找到"}
	ErrUserUpdate   = &Errno{Code: 20103, Message: "编辑用户出错"}
	// tag errors
	ErrTag         = &Errno{Code: 20201, Message: "tag 错误"}
	ErrTagExist    = &Errno{Code: 20202, Message: "tag 已经存在"}
	ErrTagNotExist = &Errno{Code: 20203, Message: "tag 不存在"}
)
