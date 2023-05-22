import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Form, Button } from "react-bootstrap";

import setHeaderToken from "../../../Contexts/SetHeaderToken";

const MainLanding = () => {
    const [user, setUser] = useState("");

    const getAuthUser = () => {
        axios.get("/auth/whoami", setHeaderToken()).then((res) => {
            setUser(res.data);
        });
    };

    useEffect(() => {
        if (!user) {
            getAuthUser();
        }
    }, [user]);

    const colors = ["red", "blue", "green", "purple"];
    const [currentColor, setCurrentColor] = useState(colors[0]);

    useEffect(() => {
        let currentIndex = 0;

        const interval = setInterval(() => {
            currentIndex = (currentIndex + 1) % colors.length;
            setCurrentColor(colors[currentIndex]);
        }, 1000); // Change color every 1 second

        return () => {
            clearInterval(interval);
        };
    }, []);

    return (
        <div>
            <h2 style={{ textAlign: "left" }}>
                Welcome Back to Social Media & Cloud Overlord {user.username}!
            </h2>

            <Container>
                <Row>
                    <Col md={{ span: 6, offset: 3 }} className="text-center">
                        <p>
                            Step 1: Load Your Credentials
                            <br />
                            <br />
                            Select the respective social media or cloud platform
                            you want to use and load your credetnials!
                        </p>

                        <hr />

                        <p>
                            Step 2: Start Playing!
                            <br />
                            <br />
                            Once you have successfully connected your accounts,
                            you can begin managing your uploads and files with
                            ease. SMCOverlord provides a user-friendly interface
                            to help you organize and control your social media
                            and cloud files.
                        </p>
                    </Col>
                </Row>
            </Container>

            <div
                style={{
                    position: "fixed",
                    bottom: 0,
                    width: "100%",
                    textAlign: "left",
                    fontWeight: "bold",
                    margin: "2px",
                    color: currentColor,
                }}
            >
                Unlock the Power of the Social Media Cloud Overlord!
            </div>
        </div>
    );
};

export default MainLanding;
