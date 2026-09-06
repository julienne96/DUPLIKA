<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>{{ $subjectText }}</title>
</head>

<body style="
    margin:0;
    padding:0;
    background:#f8f5f1;
    font-family:Arial, Helvetica, sans-serif;
    color:#222;
">

<table width="100%" cellpadding="0" cellspacing="0"
       style="padding:30px 15px;">
    <tr>
        <td align="center">

            <table width="100%" cellpadding="0" cellspacing="0"
                   style="
                       max-width:600px;
                       background:#ffffff;
                       border-radius:12px;
                       overflow:hidden;
                   ">

                <tr>
                    <td style="
                        padding:28px;
                        text-align:center;
                        background:#111111;
                        color:#ffffff;
                    ">
                        <h1 style="margin:0;font-size:30px;">
                            DUPLIKA
                        </h1>

                        <p style="margin:8px 0 0;">
                            Perruques • Accessoires • Confiance
                        </p>
                    </td>
                </tr>

                <tr>
                    <td style="padding:35px 30px;">

                        <h2 style="
                            margin-top:0;
                            font-size:24px;
                        ">
                            {{ $title }}
                        </h2>

                        <div style="
                            font-size:16px;
                            line-height:1.7;
                            white-space:pre-line;
                        ">
                            {{ $messageText }}
                        </div>

                        @if(
                            !empty($buttonLabel)
                            && !empty($buttonUrl)
                        )
                            <div style="
                                text-align:center;
                                margin-top:30px;
                            ">
                                <a
                                    href="{{ $buttonUrl }}"
                                    style="
                                        display:inline-block;
                                        padding:14px 24px;
                                        background:#d99a00;
                                        color:#ffffff;
                                        text-decoration:none;
                                        border-radius:8px;
                                        font-weight:bold;
                                    "
                                >
                                    {{ $buttonLabel }}
                                </a>
                            </div>
                        @endif

                    </td>
                </tr>

                <tr>
                    <td style="
                        padding:22px;
                        text-align:center;
                        background:#f4f4f4;
                        font-size:13px;
                        color:#666;
                    ">
                        Vous recevez cet e-mail parce que vous êtes
                        inscrit(e) à la newsletter DUPLIKA.

                        <br><br>

                        DUPLIKA
                        <br>
                        duplikaa@gmail.com
                    </td>
                </tr>

            </table>

        </td>
    </tr>
</table>

</body>
</html>