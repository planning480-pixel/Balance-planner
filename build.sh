#!/bin/sh
# รวมไฟล์ใน src/ เป็นหน้าเดียว dist/index.html แล้วตรวจ syntax
set -e
cd "$(dirname "$0")/src"
JS="3_core.js 4_views.js 4b_map.js 4a_dash.js 4e_period.js 4c_hist.js 4d_pillar.js 4f_pillars.js 5_rest.js 6_monthly.js 7_library.js"
{ cat 1_head.html 2_body.html; echo '<script>'; cat $JS; echo '</script>'; } > ../dist/index.html
cat $JS > /tmp/bp_all.js && node --check /tmp/bp_all.js && echo "build OK"
