#' <Add Title>
#'
#' <Add Description>
#'
#' @import htmlwidgets
#'
#' @export
ihazr <- function(time, status, marker, width = NULL, height = NULL) {

  # forward options using x
  x <- data.frame(
    time = time,
    status = status,
    marker = marker
  )
  
  # create widget
  htmlwidgets::createWidget(
    name = 'ihazr',
    x,
    width = width,
    height = height,
    package = 'ihazr'
  )
}

#' Widget output function for use in Shiny
#'
#' @export
ihazrOutput <- function(outputId, width = '100%', height = '400px'){
  shinyWidgetOutput(outputId, 'ihazr', width, height, package = 'ihazr')
}

#' Widget render function for use in Shiny
#'
#' @export
renderIhazr <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  shinyRenderWidget(expr, ihazrOutput, env, quoted = TRUE)
}
