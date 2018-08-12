port module Main exposing (..)

import Browser
import Browser.Navigation as Nav
import Dict as D
import Html exposing (Html, div, li, text, ul)
import Html.Attributes as A
import Html.Events as E


-- MAIN


main =
    Browser.element
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }



-- MODEL


type alias Feature =
    { name : String
    , status : Bool
    }


type alias Model =
    { features : D.Dict String Feature
    , debugMode : Bool
    }



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    availableFeatureFlags LoadAvailableFeatures



-- VIEW


view : Model -> Html Msg
view model =
    div []
        [ debugToggle model.debugMode
        , featureFlags model
        ]


debugToggle : Bool -> Html Msg
debugToggle bool =
    checkBox "" bool ToggleDebugMode


featureFlags : Model -> Html Msg
featureFlags model =
    case model.debugMode of
        True ->
            div
                []
                [ ul
                    []
                    (D.map featureToggle model.features |> D.values)
                ]

        False ->
            div [] []


featureToggle : String -> Feature -> Html Msg
featureToggle _ feature =
    li
        []
        [ checkBox feature.name feature.status (ToggleFeatureFlag feature.name)
        ]


checkBox : String -> Bool -> Msg -> Html Msg
checkBox label checked msg =
    div
        []
        [ text label
        , Html.label
            [ A.class "switch" ]
            [ Html.input
                [ A.checked checked, A.type_ "checkbox", E.onClick msg ]
                []
            , Html.span [ A.class "slider round" ] []
            ]
        ]



-- INIT


init : { debugMode : Bool } -> ( Model, Cmd Msg )
init { debugMode } =
    ( { features =
            D.empty
      , debugMode = debugMode
      }
    , Cmd.none
    )



-- UPDATE


type Msg
    = NoOp
    | ToggleFeatureFlag String
    | ToggleDebugMode
    | LoadAvailableFeatures (List Feature)


update : Msg -> Model -> ( Model, Cmd Msg )
update message model =
    case message of
        NoOp ->
            ( model, Cmd.none )

        ToggleDebugMode ->
            ( { model | debugMode = not model.debugMode }, toggleDebugMode () )

        ToggleFeatureFlag key ->
            let
                newDict =
                    D.update key (\feature -> Maybe.map (\f -> { f | status = True }) feature) model.features
            in
            ( { model | features = newDict }, toggleFeatureFlag key )

        LoadAvailableFeatures features ->
            let
                dict =
                    D.fromList (List.map (\f -> ( f.name, f )) features)
            in
            ( { model | features = dict }, Cmd.none )



-- PORTS


port availableFeatureFlags : (List Feature -> msg) -> Sub msg


port toggleDebugMode : () -> Cmd msg

port toggleFeatureFlag : String -> Cmd msg
