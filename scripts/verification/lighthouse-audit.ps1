# Production server must already be running. Runs sequentially to avoid benchmark contention.
param([string]$Names='', [switch]$Append)
$ErrorActionPreference = 'Stop'
$env:CHROME_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
$folder = '.next/legendary-lighthouse'
New-Item -ItemType Directory -Force $folder | Out-Null
$routes = @(
  @{name='home';path='/'},
  @{name='hero';path='/futures/melody'},
  @{name='story';path='/futures/forest/story'},
  @{name='memory-book';path='/memory-book'},
  @{name='lullaby-lab';path='/futures/melody/story#project-lullaby-lab'},
  @{name='three-entry';path='/meet-maria'}
)
$selected = @($Names.Split(',') | Where-Object { $_ })
if ($selected.Count) { $routes = @($routes | Where-Object { $selected -contains $_.name }) }
$results = @()
if ($Append -and (Test-Path docs/legendary-lighthouse.json)) {
  $results = @((Get-Content -Raw -Encoding UTF8 docs/legendary-lighthouse.json | ConvertFrom-Json).results | Where-Object { $selected -notcontains $_.name })
}
foreach ($route in $routes) {
  foreach ($mode in @('mobile','desktop')) {
    $runs = if ($route.name -eq 'home' -and $mode -eq 'mobile') { 3 } else { 1 }
    for ($run=1; $run -le $runs; $run++) {
      $path = "$folder/$($route.name)-$mode-$run.json"
      $arguments = @('--yes','lighthouse@13.5.0',"http://localhost:3000$($route.path)",'--chrome-flags=--headless=new --no-sandbox','--only-categories=performance,accessibility,best-practices,seo','--output=json',"--output-path=$path",'--quiet')
      if ($mode -eq 'desktop') { $arguments += '--preset=desktop' }
      & npx.cmd @arguments
      if ($LASTEXITCODE -ne 0) { throw "Lighthouse failed: $($route.name) $mode" }
      $report = Get-Content -Raw -Encoding UTF8 $path | ConvertFrom-Json
      $scores = [ordered]@{}
      foreach ($category in $report.categories.PSObject.Properties) { $scores[$category.Name] = [math]::Round($category.Value.score*100) }
      $results += [ordered]@{route=$route.path;name=$route.name;mode=$mode;run=$run;url=$report.requestedUrl;fetchTime=$report.fetchTime;lighthouseVersion=$report.lighthouseVersion;scores=$scores;metrics=[ordered]@{lcpMs=$report.audits.'largest-contentful-paint'.numericValue;tbtMs=$report.audits.'total-blocking-time'.numericValue;cls=$report.audits.'cumulative-layout-shift'.numericValue};remainingAudits=@($report.audits.PSObject.Properties | Where-Object {$null -ne $_.Value.score -and $_.Value.score -lt 1} | ForEach-Object { [ordered]@{id=$_.Name;title=$_.Value.title;displayValue=$_.Value.displayValue} })}
      $output = [ordered]@{environment='Local optimized Next.js production build; Edge headless; standard Lighthouse presets. 3D measures the entry page before explicit renderer loading.';results=$results}
      [IO.File]::WriteAllText((Join-Path (Get-Location) 'docs/legendary-lighthouse.json'),($output | ConvertTo-Json -Depth 12)+[Environment]::NewLine)
      Write-Output ("{0} {1} #{2}: {3}" -f $route.name,$mode,$run,($scores.Values -join '/'))
    }
  }
}
