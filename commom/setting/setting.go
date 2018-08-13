package setting

import (
	"time"

	"github.com/go-ini/ini"
	"github.com/lexkong/log"
)

var (
	Cfg *ini.File

	RunMode string

	HTTPPort     int
	ReadTimeout  time.Duration
	WriteTimeout time.Duration

	PageSize  int
	JwtSecret string
)

func init() {
	var err error
	Cfg, err = ini.Load("config/app.ini")
	if err != nil {
		log.Fatalf(err, "Fail to parse 'conf/app.ini': %v")
	}

	LoadBase()
	LoadServer()
	LoadApp()
	initLog()
}

func LoadBase() {
	RunMode = Cfg.Section("").Key("RUN_MODE").MustString("debug")
}

func LoadServer() {
	sec, err := Cfg.GetSection("server")
	if err != nil {
		log.Fatalf(err, "Fail to get section 'server': %v")
	}

	RunMode = Cfg.Section("").Key("RUN_MODE").MustString("debug")

	HTTPPort = sec.Key("HTTP_PORT").MustInt(8000)
	ReadTimeout = time.Duration(sec.Key("READ_TIMEOUT").MustInt(60)) * time.Second
	WriteTimeout = time.Duration(sec.Key("WRITE_TIMEOUT").MustInt(60)) * time.Second
}

func LoadApp() {
	sec, err := Cfg.GetSection("app")
	if err != nil {
		log.Fatalf(err, "Fail to get section 'app': %v")
	}

	JwtSecret = sec.Key("JWT_SECRET").MustString("!@)*#)!@U#@*!@!)")
	PageSize = sec.Key("PAGE_SIZE").MustInt(10)
}

func initLog() {
	sec, err := Cfg.GetSection("log")
	if err != nil {
		log.Fatalf(err, "Fail to get section 'log': %v")
	}
	passLagerCfg := log.PassLagerCfg{
		Writers:        sec.Key("WRITERS").MustString("file"),
		LoggerLevel:    sec.Key("LOGGER_LEVEL").MustString("RELEASE"),
		LoggerFile:     sec.Key("LOGGER_FILE").MustString("log/blog_server.log"),
		LogFormatText:  sec.Key("LOG_FORMAT_TEXT").MustBool(false),
		RollingPolicy:  sec.Key("ROLLINGPOLICY").MustString("size"),
		LogRotateDate:  sec.Key("LOG_ROTATE_DATE").MustInt(1),
		LogRotateSize:  sec.Key("LOG_ROTATE_SIZE").MustInt(1024),
		LogBackupCount: sec.Key("LOG_BACKUP_COUNT").MustInt(7),
	}
	log.InitWithConfig(&passLagerCfg)
}
