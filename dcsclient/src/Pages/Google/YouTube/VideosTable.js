import React, { useEffect, useState } from "react";
import RequestGitHubResource from "../../../Hooks/RequestResource";
import { AiOutlineSearch } from "react-icons/ai";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import {
    Button as MUIButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select as SelectMUI,
    TextField,
} from "@mui/material";
import { useSnackbar } from "notistack";
import moment from "moment";
import { Formik, Form, Field } from "formik";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import * as Yup from "yup";

import { fileTableStyle } from "../../../Windows/TableStyle";
import { deleteDialogPrompt } from "../../../Windows/DialogBox";


function VideosTable() {
    const { enqueueSnackbar } = useSnackbar();

    return (
        <div>

        </div>
    );
}

export default VideosTable;
