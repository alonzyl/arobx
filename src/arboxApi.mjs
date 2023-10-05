class ArboxApi {
  constructor(email, password, whiteLabel) {
    this.email = email;
    this.password = password;
    this.whiteLabel = whiteLabel;
    this.user = {
      id: undefined,
      token: "",
      refreshToken: "",
      membershipId: undefined,
    };
  }

  loginArbox = async () => {
    try {
      const response = await fetch(
        "https://apiappv2.arboxapp.com/api/v2/user/login",
        {
          method: "POST",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
            whiteLabel: this.whiteLabel,
          },
          body: JSON.stringify({
            email: this.email,
            password: this.password,
          }),
        }
      );

      if (response.status !== 200) {
        throw new Error(response.status);
      }

      const responseData = await response.json();

      const userMembership = await this.getArboxMembership(
        responseData.data.token,
        responseData.data.refreshToken
      );

      this.user = {
        ...this.user,
        ...responseData.data,
        membershipId: userMembership.id,
      };
      console.log("User logged in successfully.");
    } catch (e) {
      console.log("Login failed");
      throw new Error(e);
    }
  };

  getArboxMembership = async (token, refreshToken) => {
    try {
      const response = await fetch(
        "https://apiappv2.arboxapp.com/api/v2/boxes/470/memberships/1",
        {
          method: "GET",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
            accessToken: token,
            refreshToken: refreshToken,
            whiteLabel: this.whiteLabel,
          },
        }
      );

      if (response.status !== 200) {
        throw new Error(response.status);
      }

      return (await response.json()).data[0];
    } catch (e) {
      console.log("Issue with getting arbox membership");
      throw new Error(e);
    }
  };

  registerWorkout = async (scheduleId) => {
    const workoutData = {
      extras: null,
      membership_user_id: this.user.membershipId,
      schedule_id: scheduleId,
    };

    try {
      const response = await fetch(
        "https://apiappv2.arboxapp.com/api/v2/scheduleUser/insert",
        {
          method: "POST",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
            accessToken: this.user.token,
            refreshToken: this.user.refreshToken,
            whiteLabel: this.whiteLabel,
          },
          body: JSON.stringify(workoutData),
        }
      );

      if (response.status === 200) {
        console.log("Enrolled successfully");
      } else {
        this.enterWaitingList(workoutData);
      }
    } catch (e) {
      console.log("Issue with enrolling to");
      throw new Error(e);
    }
  };

  enterWaitingList = async (workoutData) => {
    try {
      const response = await fetch(
        "https://apiappv2.arboxapp.com/api/v2/scheduleStandBy/insert",
        {
          method: "POST",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
            accessToken: this.user.token,
            refreshToken: this.user.refreshToken,
            whiteLabel: this.whiteLabel,
          },
          body: JSON.stringify(workoutData),
        }
      );

      if (response.status === 200) {
        console.log("entered waiting list");
      } else {
        throw new Error((await response.json()).error.messageToUser[0].message);
      }
    } catch (e) {
      console.log("Issue with entering waiting list");
      throw new Error(e);
    }
  };

  getScheduleByDate = async (date, boxId) => {
    const info = {
      from: date,
      locations_box_id: boxId,
      to: date,
    };

    try {
      const response = await fetch(
        "https://apiappv2.arboxapp.com/api/v2/schedule/betweenDates",
        {
          method: "POST",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
            accessToken: this.user.token,
            refreshToken: this.user.refreshToken,
            whiteLabel: this.whiteLabel,
          },
          body: JSON.stringify(info),
        }
      );

      if (response.status !== 200) {
        throw new Error(response.status);
      }

      return (await response.json()).data;
    } catch (e) {
      console.log("Issue with getting a schedule");
      throw new Error(e);
    }
  };

  getBoxLocationsIds = async () => {
    try {
      const response = await fetch(
        "https://apiappv2.arboxapp.com/api/v2/boxes/locations",
        {
          method: "GET",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
            accessToken: this.user.token,
            refreshToken: this.user.refreshToken,
            whiteLabel: this.whiteLabel,
          },
        }
      );

      if (response.status !== 200) {
        throw new Error();
      }

      return (await response.json()).data[0].locations_box;
    } catch (e) {
      console.log("Issue with getting arbox locations");
      throw new Error(e);
    }
  };
}

export default ArboxApi;
