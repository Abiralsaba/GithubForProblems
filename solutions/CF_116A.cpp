#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    int cur = 0, ans = 0;
    while (n--) {
        int a, b;
        cin >> a >> b;
        cur -= a;
        cur += b;
        if (cur > ans) ans = cur;
    }
    cout << ans << endl;
    return 0;
}
