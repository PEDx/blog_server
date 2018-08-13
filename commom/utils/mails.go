package utils

import gomail "gopkg.in/gomail.v2"

type Mail struct {
	From      string
	To        string
	TName     string
	SName     string
	Title     string
	Content   string
	SSever    string
	SPort     int
	SPassword string
}

func sendMail(m Mail) {
	gm := gomail.NewMessage()
	gm.SetAddressHeader("From", m.From, m.SName) // 发件人
	gm.SetHeader("To",
		gm.FormatAddress(m.To, m.TName), // 收件人
	)
	gm.SetHeader("Subject", m.Title)   // 主题
	gm.SetBody("text/html", m.Content) // 正文

	d := gomail.NewPlainDialer(m.SSever, m.SPort, m.From, m.SPassword) // 发送邮件服务器、端口、发件人账号、发件人密码
	if err := d.DialAndSend(gm); err != nil {
		panic(err)
	}
}
