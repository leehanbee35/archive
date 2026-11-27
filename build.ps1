# 서랍 묶기: components / tags.json / glossary.json / refs.json / demos 를 읽어서 index.html 안에 채워 넣는다.
# (파일 하나로 더블클릭해서 어디서든 열리게)
$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$utf8 = New-Object Text.UTF8Encoding $false
function Read-Json($name) {
  $p = Join-Path $here $name
  if (Test-Path $p) { [IO.File]::ReadAllText($p, $utf8) | ConvertFrom-Json } else { $null }
}

# tags.json: { "조각": ["토글", ...] } — 검색용 한국어 # 태그
$tagMap = Read-Json 'tags.json'
# refs.json: { "조각": "보낸 참고 영상 주소" }
$refMap = Read-Json 'refs.json'

$items = @()
foreach ($f in Get-ChildItem (Join-Path $here 'components') -Filter *.html | Sort-Object Name) {
  $html = [IO.File]::ReadAllText($f.FullName, $utf8)
  # 각 파일 2번째 줄의 <!-- meta: {...} --> 에서 이름·분류·설명을 읽는다
  $m = [regex]::Match($html, '<!--\s*meta:\s*(\{.*?\})\s*-->')
  $meta = if ($m.Success) { $m.Groups[1].Value | ConvertFrom-Json } else { [pscustomobject]@{ name = $f.BaseName; cat = '기타'; desc = ''; added = '' } }
  $items += [pscustomobject][ordered]@{
    id    = $f.BaseName
    file  = 'components/' + $f.Name
    name  = $meta.name
    cat   = $meta.cat
    desc  = $meta.desc
    added = $meta.added
    tags  = @(if ($tagMap -and $tagMap.($f.BaseName)) { $tagMap.($f.BaseName) })
    video = $(if ($refMap) { $refMap.($f.BaseName) } else { $null })
    html  = $html
  }
}
$json = ConvertTo-Json -InputObject @($items) -Depth 4 -Compress

# glossary.json: 용어사전 (k = 연결되는 한국어 태그)
$gJson = '[]'
$gFile = Join-Path $here 'glossary.json'
if (Test-Path $gFile) {
  $gRaw = [IO.File]::ReadAllText($gFile, $utf8)
  $null = $gRaw | ConvertFrom-Json   # 형식이 틀렸으면 여기서 멈춘다
  $gJson = $gRaw.Trim() -replace '</', '<\/'
}

# demos 폴더: 용어사전 미리보기 스크립트들을 이어 붙인다
$demoJs = ''
$demoDir = Join-Path $here 'demos'
if (Test-Path $demoDir) {
  foreach ($df in Get-ChildItem $demoDir -Filter *.js | Sort-Object Name) {
    $demoJs += "`n/* ---- $($df.Name) ---- */`n" + ([IO.File]::ReadAllText($df.FullName, $utf8) -replace '</script', '<\/script') + "`n"
  }
}

$idx = Join-Path $here 'index.html'
$page = [IO.File]::ReadAllText($idx, $utf8)
$dataBlock = "// DATA-START (build.ps1이 자동으로 채워요. 직접 고치지 마세요)`nwindow.LIBRARY = $json;`nwindow.GLOSSARY = $gJson;`n// DATA-END"
$demoBlock = "// DEMOS-START (build.ps1이 demos 폴더의 미리보기를 여기에 채워요. 직접 고치지 마세요)$demoJs`n// DEMOS-END"
$page = [regex]::Replace($page, '(?s)// DATA-START.*?// DATA-END', { param($m) $dataBlock })
$page = [regex]::Replace($page, '(?s)// DEMOS-START.*?// DEMOS-END', { param($m) $demoBlock })
[IO.File]::WriteAllText($idx, $page, $utf8)
"묶음 완료: 조각 $($items.Count)개, 용어 $([regex]::Matches($gJson, '"t":').Count)개"
