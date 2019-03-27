import Axios from 'axios'
import React, { ChangeEvent, SyntheticEvent } from 'react'
import { withStyles, WithStyles } from '@material-ui/core/styles'
import {
  AppBar,
  Toolbar,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Snackbar,
  Paper,
  Modal,
} from '@material-ui/core'
import MySnackBarContent from './MySnackBar'

const styles = (theme: any) => ({
  root: {
    flexGrow: 1,
  },
  button: {
    margin: 20,
  },
  paper: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    margin: 20,
  },
})

interface IProp extends WithStyles<typeof styles> {}

interface IState {
  link: string
  downloadLink: string
  errorMessage: string
  showError: boolean
  isLoading: boolean
}

class MainPage extends React.Component<IProp, IState> {
  constructor(props: IProp) {
    super(props)
    this.state = {
      link: '',
      downloadLink: '',
      errorMessage: '',
      showError: false,
      isLoading: false,
    }

    this.generateLink = this.generateLink.bind(this)
    this.onChange = this.onChange.bind(this)
    this.handleErrorClose = this.handleErrorClose.bind(this)
    this.handleErrorCloseBySnackbar = this.handleErrorCloseBySnackbar.bind(this)
  }

  onChange(e: ChangeEvent<HTMLInputElement>) {
    let link = e.target.value

    this.setState({
      link,
    })
  }

  downloadURLfromRedirected(url: string): string {
    const splitted = url.split('/')
    return (
      'http://s3.amazonaws.com/watchfrenzy/watches/' +
      splitted[splitted.length - 1]
    )
  }

  async generateLink() {
    this.setState({
      isLoading: true,
    })
    let link = this.state.link
    const splitted = this.state.link.split('/')
    if (link.startsWith('https://facerepo.com/'))
      link.replace('https://facerepo.com/', '')

    try {
      const response = await Axios.post('/', {
        link: this.state.link,
      })

      if (response.data.success) {
        this.setState({
          downloadLink: response.data.downloadURL,
          isLoading: false,
        })
      } else {
        console.log(response.data)
        throw new Error(response.data.error)
      }
    } catch (e) {
      this.setState({
        downloadLink: '',
        showError: true,
        errorMessage: e.message || 'Unknown error!',
        isLoading: false,
      })
    }
  }

  dataURItoBlob(dataURI: string): Blob {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1])

    // separate out the mime component
    var mimeString = dataURI
      .split(',')[0]
      .split(':')[1]
      .split(';')[0]

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length)
    var ia = new Uint8Array(ab)
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i)
    }

    // write the ArrayBuffer to a blob, and you're done
    var bb = new Blob([ab])
    return bb
  }

  handleErrorClose(e: React.MouseEvent<HTMLElement, MouseEvent>) {
    this.setState({
      showError: false,
    })
  }

  handleErrorCloseBySnackbar(
    event: SyntheticEvent<any, Event>,
    reason: string
  ) {
    this.setState({
      showError: false,
    })
  }

  render() {
    const { classes } = this.props
    return (
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" color="inherit">
              Watchmaker Link Generator
            </Typography>
          </Toolbar>
        </AppBar>

        <div style={{ margin: '20px' }}>
          <TextField
            value={this.state.link}
            onChange={this.onChange}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  https://facerepo.com/
                </InputAdornment>
              ),
            }}
            label="WatchMaker Link"
          />
        </div>
        <div
          style={{
            textAlign: 'right',
          }}
        >
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={this.generateLink}
          >
            Go!
          </Button>
        </div>
        <Paper
          className={classes.paper}
          elevation={1}
          style={{
            display: this.state.downloadLink.length > 0 ? 'block' : 'none',
          }}
        >
          <Typography variant="h5" component="h3">
            Your download link
          </Typography>
          <Typography variant="body1">{this.state.downloadLink}</Typography>
        </Paper>

        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          open={this.state.showError}
          onClose={this.handleErrorCloseBySnackbar}
        >
          <MySnackBarContent
            onClose={this.handleErrorClose}
            variant="error"
            className={classes.button}
            message={this.state.errorMessage}
          />
        </Snackbar>
        <Modal open={this.state.isLoading}>
          <div />
        </Modal>
      </div>
    )
  }
}

export default withStyles(styles)(MainPage)
