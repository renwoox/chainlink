package models

import (
	"time"

	"github.com/smartcontractkit/chainlink/utils"
)

// User holds the credentials and session ID for API use.
type User struct {
	Email          string `json:"email" storm:"id,unique"`
	HashedPassword string `json:"hashedPassword"`
	SessionID      string `json:"sessionId" storm:"index,unique"`
	CreatedAt      Time   `json:"createdAt"`
}

// NewUser creates a new user by hashing the passed plainPwd with bcrypt.
func NewUser(email, plainPwd string) (User, error) {
	pwd, err := utils.HashPassword(plainPwd)
	if err != nil {
		return User{}, err
	}

	return User{
		Email:          email,
		HashedPassword: pwd,
		CreatedAt:      Time{Time: time.Now()},
	}, nil
}

// SessionRequest encapsulates the fields needed to generate a new SessionID,
// including the hashed password.
type SessionRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}
