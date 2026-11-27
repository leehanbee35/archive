# 보관함 묶기: components 폴더의 html 파일들을 읽어서 library-data.js 하나로 만든다.
# 각 파일 맨 위의 <!-- meta: {...} --> 줄에서 이름·분류·설명을 읽는다.
$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$utf8 = New-Object Text.UTF8Encoding $false
$items = @()
# tags.json: { "파일이름": ["토글", "다크모드", ...] } — 검색용 # 태그
$tagFile = Join-Path $here 'tags.json'
$tagMap = if (Test-Path $tagFile) { [IO.File]::ReadAllText($tagFile, $utf8) | ConvertFrom-Json } else { $null }
foreach ($f in Get-ChildItem (Join-Path $here 'components') -Filter *.html | Sort-Object Name) {
  $html = [IO.File]::ReadAllText($f.FullName, $utf8)
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
    html  = $html
  }
}
$json = ConvertTo-Json -InputObject @($items) -Depth 4 -Compress
# index.html 안의 DATA-START ~ DATA-END 사이에 넣는다 (파일 하나로 어디서든 열리게)
$idx = Join-Path $here 'index.html'
$page = [IO.File]::ReadAllText($idx, $utf8)
# glossary.json: 용어사전
$gFile = Join-Path $here 'glossary.json'
$gJson = '[]'
if (Test-Path $gFile) {
  $gRaw = [IO.File]::ReadAllText($gFile, $utf8)
  $null = $gRaw | ConvertFrom-Json   # 형식이 틀렸으면 여기서 멈춘다
  $gJson = $gRaw.Trim() -replace '</', '<\/'
}
$block = "// DATA-START (build.ps1이 자동으로 채워요. 직접 고치지 마세요)`nwindow.LIBRARY = $json;`nwindow.GLOSSARY = $gJson;`n// DATA-END"
$page = [regex]::Replace($page, '(?s)// DATA-START.*?// DATA-END', { param($m) $block })
[IO.File]::WriteAllText($idx, $page, $utf8)

# glossary.html (따로 보는 용어사전): 용어 + 조각 이름·태그만 넣는다 (코드는 빼서 가볍게)
$gPage = Join-Path $here 'glossary.html'
if (Test-Path $gPage) {
  # refs.json: { "조각이름": "참고 영상 주소" } — 보낸 영상을 용어사전에 같이 보여 준다
  $refFile = Join-Path $here 'refs.json'
  $refMap = if (Test-Path $refFile) { [IO.File]::ReadAllText($refFile, $utf8) | ConvertFrom-Json } else { $null }
  $lite = ConvertTo-Json -InputObject @($items | ForEach-Object {
    [ordered]@{ id = $_.id; name = $_.name; tags = $_.tags; video = $(if ($refMap) { $refMap.($_.id) } else { $null }) }
  }) -Depth 4 -Compress
  $gBlock = "// DATA-START (build.ps1이 자동으로 채워요. 직접 고치지 마세요)`nwindow.GLOSSARY = $gJson;`nwindow.ITEMS = $lite;`n// DATA-END"
  $gText = [IO.File]::ReadAllText($gPage, $utf8)
  $gText = [regex]::Replace($gText, '(?s)// DATA-START.*?// DATA-END', { param($m) $gBlock })
  # demos 폴더의 미리보기 스크립트들을 이어 붙여 넣는다
  $demoDir = Join-Path $here 'demos'
  $demoJs = ''
  if (Test-Path $demoDir) {
    foreach ($df in Get-ChildItem $demoDir -Filter *.js | Sort-Object Name) {
      $demoJs += "`n/* ---- $($df.Name) ---- */`n" + ([IO.File]::ReadAllText($df.FullName, $utf8) -replace '</script', '<\/script') + "`n"
    }
  }
  $dBlock = "// DEMOS-START (build.ps1이 demos 폴더의 미리보기를 여기에 채워요. 직접 고치지 마세요)$demoJs`n// DEMOS-END"
  $gText = [regex]::Replace($gText, '(?s)// DEMOS-START.*?// DEMOS-END', { param($m) $dBlock })
  [IO.File]::WriteAllText($gPage, $gText, $utf8)
}
"묶음 완료: $($items.Count)개"
