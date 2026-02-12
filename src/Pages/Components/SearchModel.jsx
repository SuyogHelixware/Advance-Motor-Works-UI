import CloseIcon from "@mui/icons-material/Close";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import SearchInputField from "./SearchInputField";
import { useNavigate } from "react-router-dom";
const SearchModel = ({
  open,
  onClose,
  onSubmit,
  title,
  cardData,
  value,
  onChange,
  onClickClear,
}) => {
  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        scroll="paper"
        onSubmit={onSubmit}
        // maxWidth="sm" // Use predefined sizes or define a custom maxWidth
        // sx={{
        //   '& .MuiDialog-paper': {
        //     width: '90vw',  // Make width responsive
        //     maxWidth: '370px', // Limit max width
        //     height: '78vh',  // Set height responsive
        //     maxHeight: '80vh', // Limit max height
        //     margin: 'auto',  // Center the Dialog
        //   },
        // }}
        maxWidth="sm"
        sx={{
          display: "flex", // Use flexbox for alignment
          justifyContent: "center", // Center horizontally
          alignItems: "center", // Center vertically
          margin: "auto", // Center the dialog with auto margin
          width: "100%", // Full width but with maxWidth controlled
          minWidth: 400, // Min width for responsiveness
          maxWidth: 500,
        }}
      >
        <DialogTitle>
          <Grid
            container
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Grid item display="flex" alignItems="center">
              <PersonAddAlt1OutlinedIcon />
              <Typography textAlign="center" fontWeight="bold">
                &nbsp; &nbsp;{title}
              </Typography>
            </Grid>
            <IconButton
              edge="end"
              color="inherit"
              aria-label="close"
              onClick={onClose}
              sx={{
                position: "absolute",
                right: "12px",
                top: "0px",
              }}
            >
              <CloseIcon />
            </IconButton>
          </Grid>
        </DialogTitle>

        <Divider color="gray" />
        <DialogContent className="bg-light">
          <Grid item>
            <SearchInputField
              value={value}
              onChange={onChange}
              onClickClear={onClickClear}
            />
          </Grid>
          <Grid
            container
            mt={0.5}
            width={"100%"}
            style={{
              height: "50vh",
              width: "100%",
              overflow: "auto",
              padding: 10,
              justifyContent: "flex-start", // border:"1px solid black"
            }}
            id="getListForCreateScroll"
          >
            <Grid item xs={12}>
              {cardData}
            </Grid>{" "}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between" }}>
          {/* <Button
            variant="contained"
            color="success"
            name="Close"
            sx={{ color: "white" }}
            // onClick={onClose}
            size="small"
          >
            Save
          </Button> */}
          {/* <Button
            variant="contained"
            color="error"
            name="Close"
            onClick={onClose}
            size="small"
          >
            close
          </Button> */}
        </DialogActions>
      </Dialog>
    </>
  );
};

export const CopyFromSearchModel = ({
  open,
  onClose,
  onSubmit,
  title,
  Input,
  cardData,
  value,
  onChange,
  onClickClear,
  onSelectChange,
  onSave,
  ButtonCopyForm = "NEXT",
}) => {
  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        scroll="paper"
        onSubmit={onSubmit}
        maxWidth="sm"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "auto",
          width: "100%",
          minWidth: 400,
          maxWidth: 500,
          //  zIndex: 3000,
        }}
      >
        <DialogTitle>
          <Grid
            container
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            {/* <Grid item display="flex" alignItems="center">
              <Typography textAlign="center" fontWeight="bold">
                &nbsp; &nbsp;{title}
              </Typography>
            </Grid> */}
            {/* <Grid item   xs={12} sm={6} md={4} lg={4} textAlign={"center"}> */}

            {Input}

            {/* </Grid>  */}
          </Grid>
        </DialogTitle>

        <Divider color="gray" />
        <DialogContent className="bg-light">
          <Grid item>
            <SearchInputField
              value={value}
              onChange={onChange}
              onClickClear={onClickClear}
            />
          </Grid>
          <Grid
            container
            mt={0.5}
            width={"100%"}
            style={{
              height: "50vh",
              overflow: "auto",
              padding: 1,
              justifyContent: "center",
            }}
            id="getListForCreateScroll"
          >
            <Grid>{cardData}</Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between" }}>
          <Button
            variant="contained"
            color="info"
            sx={{ color: "white" }}
            size="small"
            onClick={onSave}
          >
            {ButtonCopyForm}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={onClose}
            size="small"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const SearchModel1 = ({
  open,
  onClose,
  onSubmit,
  title,
  cardData,
  value,
  onChange,
  onClickClear,
}) => {
  return (
    <>
      <Dialog
        // style={{ height:"80%", width:700 , margin: 'auto', }}
        open={open}
        onClose={onClose}
        scroll="paper"
        onSubmit={onSubmit}
        maxWidth="sm" // Use predefined sizes or define a custom maxWidth
        sx={{
          "& .MuiDialog-paper": {
            width: "90vw", // Make width responsive
            maxWidth: "700px", // Limit max width
            height: "80vh", // Set height responsive
            maxHeight: "80vh", // Limit max height
            margin: "auto", // Center the Dialog
          },
        }}
      >
        <DialogTitle>
          <Grid item display={"flex"} justifyContent={"center"}>
            <PersonAddAlt1OutlinedIcon />
            <Typography textAlign={"center"} fontWeight={"bold"}>
              &nbsp; &nbsp;{title}
            </Typography>
          </Grid>
        </DialogTitle>

        <Divider color="gray" />

        <DialogContent className="bg-light">
          <Grid item>
            <SearchInputField
              value={value}
              onChange={onChange}
              onClickClear={onClickClear}
            />
          </Grid>
          <Grid
            container
            mt={0.5}
            style={{
              height: "60vh",
              width: "auto",
              overflow: "auto",
              padding: 10,
            }}
            id="getListForCreateScroll"
          >
            <Grid mt={1} width={"700px"}>
              {cardData}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            color="error"
            name="Close"
            onClick={onClose}
            size="small"
          >
            close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
export const SearchModel2 = ({
  open,
  onClose,
  onSubmit,
  title,
  cardData,
  value,
  onChange,
  onClickClear,
}) => {
  return (
    <>
      <Dialog
        // style={{ height:"80%", width:700 , margin: 'auto', }}
        open={open}
        onClose={onClose}
        scroll="paper"
        onSubmit={onSubmit}
        maxWidth="sm" // Use predefined sizes or define a custom maxWidth
        sx={{
          "& .MuiDialog-paper": {
            width: "30vw", // Make width responsive
            maxWidth: "400px", // Limit max width
            height: "90vh", // Set height responsive
            maxHeight: "90vh", // Limit max height
            margin: "auto", // Center the Dialog
          },
        }}
      >
        <DialogTitle>
          <Grid item display={"flex"} justifyContent={"center"}>
            <PersonAddAlt1OutlinedIcon />
            <Typography textAlign={"center"} fontWeight={"bold"}>
              &nbsp; &nbsp;{title}
            </Typography>
          </Grid>
        </DialogTitle>

        <Divider color="gray" />

        <DialogContent className="bg-light">
          <Grid item>
            <SearchInputField
              value={value}
              onChange={onChange}
              onClickClear={onClickClear}
            />
          </Grid>
          <Grid
            container
            mt={0.5}
            style={{
              height: "70vh",
              width: "auto",
              overflow: "auto",
              padding: 0,
            }}
            id="getListForCreateScroll"
          >
            <Grid mt={1} width={"700px"}>
              {cardData}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between" }}>
          <Button
            variant="contained"
            color="success"
            name="Close"
            onClick={onClose}
            size="small"
          >
            Save
          </Button>
          <Button
            variant="contained"
            color="error"
            name="Close"
            onClick={onClose}
            size="small"
          >
            close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const SearchModelPrint = ({
  open,
  onClose,
  onSubmit,
  title,
  cardData,
  value,
  onChange,
  onClickClear,
  ActionBtn,
}) => {
  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        scroll="paper"
        onSubmit={onSubmit}
        // maxWidth="sm" // Use predefined sizes or define a custom maxWidth
        // sx={{
        //   '& .MuiDialog-paper': {
        //     width: '90vw',  // Make width responsive
        //     maxWidth: '370px', // Limit max width
        //     height: '78vh',  // Set height responsive
        //     maxHeight: '80vh', // Limit max height
        //     margin: 'auto',  // Center the Dialog
        //   },
        // }}
        maxWidth="sm"
        sx={{
          display: "flex", // Use flexbox for alignment
          justifyContent: "center", // Center horizontally
          alignItems: "center", // Center vertically
          margin: "auto", // Center the dialog with auto margin
          width: "100%", // Full width but with maxWidth controlled
          minWidth: 400, // Min width for responsiveness
          maxWidth: 500,
        }}
      >
        <DialogTitle>
          <Grid
            container
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Grid item display="flex" alignItems="center">
              <PersonAddAlt1OutlinedIcon />
              <Typography textAlign="center" fontWeight="bold">
                &nbsp; &nbsp;{title}
              </Typography>
            </Grid>
            <IconButton
              edge="end"
              color="inherit"
              aria-label="close"
              onClick={onClose}
              sx={{
                position: "absolute",
                right: "12px",
                top: "0px",
              }}
            >
              <CloseIcon />
            </IconButton>
          </Grid>
        </DialogTitle>

        <Divider color="gray" />
        <DialogContent className="bg-light">
          <Grid item>
            <SearchInputField
              value={value}
              onChange={onChange}
              onClickClear={onClickClear}
            />
          </Grid>
          <Grid
            container
            mt={0.5}
            width={"100%"}
            style={{
              height: "50vh",
              width: "100%",
              overflow: "auto",
              padding: 10,
              justifyContent: "center",
              // border:"1px solid black"
            }}
            id="getListForCreateScroll"
          >
            <Grid mt={1}>{cardData}</Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between" }}>
          <Button
            variant="contained"
            color="info"
            name="Close"
            sx={{ color: "white" }}
            // onClick={onClose}
            size="small"
          >
            {ActionBtn}
          </Button>
          <Button
            variant="contained"
            color="error"
            name="Close"
            onClick={onClose}
            size="small"
          >
            close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const SearchBPModel = ({
  open,
  onClose,
  onSubmit,
  title,
  cardData,
  value,
  onChange,
  onClickClear,
}) => {
    const navigate = useNavigate();
  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        scroll="paper"
        onSubmit={onSubmit}
        // maxWidth="sm" // Use predefined sizes or define a custom maxWidth
        // sx={{
        //   '& .MuiDialog-paper': {
        //     width: '90vw',  // Make width responsive
        //     maxWidth: '370px', // Limit max width
        //     height: '78vh',  // Set height responsive
        //     maxHeight: '80vh', // Limit max height
        //     margin: 'auto',  // Center the Dialog
        //   },
        // }}
        maxWidth="sm"
        sx={{
          display: "flex", // Use flexbox for alignment
          justifyContent: "center", // Center horizontally
          alignItems: "center", // Center vertically
          margin: "auto", // Center the dialog with auto margin
          width: "100%", // Full width but with maxWidth controlled
          minWidth: 400, // Min width for responsiveness
          maxWidth: 500,
        }}
      >
        <DialogTitle>
          <Grid
            container
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Grid item display="flex" alignItems="center">
              <AddBusinessIcon   
              sx={{ cursor: "pointer" }}
  onClick={() =>
    navigate("/dashboard/Master/business-partner", { replace: true })
  } />
              <Typography textAlign="center" fontWeight="bold">
                &nbsp; &nbsp;{title}
              </Typography>
            </Grid>
            <IconButton
              edge="end"
              color="inherit"
              aria-label="close"
              onClick={onClose}
              sx={{
                position: "absolute",
                right: "12px",
                top: "0px",
              }}
            >
              <CloseIcon />
            </IconButton>
          </Grid>
        </DialogTitle>

        <Divider color="gray" />
        <DialogContent className="bg-light">
          <Grid item>
            <SearchInputField
              value={value}
              onChange={onChange}
              onClickClear={onClickClear}
            />
          </Grid>
          <Grid
            container
            mt={0.5}
            width={"100%"}
            style={{
              height: "50vh",
              width: "100%",
              overflow: "auto",
              padding: 10,
              justifyContent: "flex-start", // border:"1px solid black"
            }}
            id="getListForCreateScroll"
          >
            <Grid item xs={12}>
              {cardData}
            </Grid>{" "}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between" }}>
          {/* <Button
            variant="contained"
            color="success"
            name="Close"
            sx={{ color: "white" }}
            // onClick={onClose}
            size="small"
          >
            Save
          </Button> */}
          {/* <Button
            variant="contained"
            color="error"
            name="Close"
            onClick={onClose}
            size="small"
          >
            close
          </Button> */}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SearchModel;
