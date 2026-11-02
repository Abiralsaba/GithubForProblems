#include <bits/stdc++.h>
using namespace std;

int main() {
    int t;
    cin >> t;
    while (t--) {
        int n;
        long long k;
        cin >> n >> k;
        long long a[n];
        for (int i = 0; i < n; i++) cin >> a[i];
        long long sum = 0;
        for (int i = 0; i < n; i++) sum += a[i];
        if (k >= sum) {
            cout << n << endl;
            continue;
        }
        long long k_left = (k + 1) / 2;
        long long k_right = k / 2;
        int l = 0;
        int r = n - 1;
        while (l <= r && k_left > 0) {
            if (a[l] <= k_left) {
                k_left -= a[l];
                l++;
            } else {
                a[l] -= k_left;
                k_left = 0;
            }
        }
        while (l <= r && k_right > 0) {
            if (a[r] <= k_right) {
                k_right -= a[r];
                r--;
            } else {
                a[r] -= k_right;
                k_right = 0;
            }
        }
        int ans = n - (r - l + 1);
        cout << ans << endl;
    }
    return 0;
}
